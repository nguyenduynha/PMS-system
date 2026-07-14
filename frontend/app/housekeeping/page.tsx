"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { RoomAPI } from "@/services/room.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BedDouble, CheckCircle2, Clock3, Loader2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

const statusMeta: Record<string, { label: string; className: string }> = {
  DIRTY: { label: "Chờ dọn", className: "border-rose-200 bg-rose-50 text-rose-700" },
  CLEANING: { label: "Đang dọn", className: "border-amber-200 bg-amber-50 text-amber-700" },
  AVAILABLE: { label: "Đã sạch", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("TASKS");
  const [search, setSearch] = useState("");

  const loadRooms = useCallback(async () => {
    try { setRooms(await RoomAPI.getHousekeepingRooms()); }
    catch (error: any) { toast.error(error.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const changeStatus = async (id: string, status: "CLEANING" | "AVAILABLE") => {
    try {
      setUpdating(id);
      await RoomAPI.updateHousekeepingStatus(id, status);
      setRooms((current) => current.map((room) => room.id === id ? { ...room, status } : room));
      toast.success(status === "AVAILABLE" ? "Đã hoàn tất dọn phòng" : "Đã nhận công việc dọn phòng");
    } catch (error: any) { toast.error(error.message); }
    finally { setUpdating(null); }
  };

  const visibleRooms = useMemo(() => rooms.filter((room) => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(search.toLowerCase()) || room.roomType?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || (filter === "TASKS" ? ["DIRTY", "CLEANING"].includes(room.status) : room.status === filter);
    return matchesSearch && matchesFilter;
  }), [rooms, search, filter]);

  const count = (status: string) => rooms.filter((room) => room.status === status).length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title="Buồng phòng" subtitle="Danh sách công việc vệ sinh độc lập với bộ phận đặt phòng" />
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <div className="mx-auto max-w-[1500px] space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Chờ dọn", count("DIRTY"), BedDouble, "text-rose-600 bg-rose-50"],
                ["Đang thực hiện", count("CLEANING"), Clock3, "text-amber-600 bg-amber-50"],
                ["Phòng sẵn sàng", count("AVAILABLE"), CheckCircle2, "text-emerald-600 bg-emerald-50"],
              ].map(([label, value, Icon, color]: any) => (
                <Card key={label} className="rounded-2xl border-slate-200 shadow-sm"><CardContent className="flex items-center gap-4 p-4">
                  <div className={`rounded-xl p-3 ${color}`}><Icon className="size-5" /></div>
                  <div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-900">{value}</p></div>
                </CardContent></Card>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={filter} onValueChange={setFilter}><TabsList className="rounded-xl bg-slate-100">
                <TabsTrigger value="TASKS">Công việc</TabsTrigger><TabsTrigger value="DIRTY">Chờ dọn</TabsTrigger>
                <TabsTrigger value="CLEANING">Đang dọn</TabsTrigger><TabsTrigger value="ALL">Tất cả</TabsTrigger>
              </TabsList></Tabs>
              <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-slate-400" /><Input className="w-full rounded-xl pl-9 sm:w-64" placeholder="Tìm số phòng..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </div>

            {loading ? <div className="flex h-60 items-center justify-center"><Loader2 className="size-7 animate-spin text-blue-600" /></div> :
              visibleRooms.length === 0 ? <div className="rounded-2xl border border-dashed bg-white py-20 text-center text-slate-500"><Sparkles className="mx-auto mb-3 size-9 text-emerald-500" />Không có phòng cần xử lý</div> :
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visibleRooms.map((room) => {
                const meta = statusMeta[room.status] || { label: room.status, className: "" };
                return <Card key={room.id} className="overflow-hidden rounded-2xl border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="p-0"><div className="flex items-start justify-between border-b bg-slate-50/80 p-4">
                    <div><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Phòng</p><p className="text-3xl font-bold text-slate-900">{room.roomNumber}</p></div>
                    <Badge variant="outline" className={`rounded-full ${meta.className}`}>{meta.label}</Badge>
                  </div><div className="space-y-4 p-4"><div className="text-sm"><p className="font-semibold text-slate-700">{room.roomType?.name}</p><p className="text-slate-500">Tầng {room.floor || "—"} · {room.note || "Vệ sinh tiêu chuẩn"}</p></div>
                  {room.status === "DIRTY" && <Button className="w-full rounded-xl bg-amber-500 hover:bg-amber-600" disabled={updating === room.id} onClick={() => changeStatus(room.id, "CLEANING")}>{updating === room.id && <Loader2 className="mr-2 size-4 animate-spin" />}Nhận dọn phòng</Button>}
                  {room.status === "CLEANING" && <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700" disabled={updating === room.id} onClick={() => changeStatus(room.id, "AVAILABLE")}>{updating === room.id && <Loader2 className="mr-2 size-4 animate-spin" />}Hoàn tất · Phòng sạch</Button>}
                  {room.status === "AVAILABLE" && <div className="flex h-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700"><CheckCircle2 className="mr-2 size-4" />Sẵn sàng đón khách</div>}
                  </div></CardContent></Card>;
              })}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
