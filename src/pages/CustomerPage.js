import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { getCustomers } from "../api/customer";
import { useDebounce } from "../hooks/useDebounce";
import { Badge } from "../components/ui/badge";
import { Search, Plus, Filter, ChevronRight, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

const CustomerPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("고객 목록");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchCustomers = async (search = "") => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomers({ search });
      setCustomers(data);
    } catch (err) {
      setError("고객 정보를 불러오는데 실패했습니다.");
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleViewDetails = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const removeFilter = () => {
    setStatusFilter("all");
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">
          고객 관리 ({filteredCustomers.length}명)
        </h1>
        <Button
          onClick={() => navigate("/customers/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          고객 등록
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="p-4 border-b border-gray-200 grid grid-cols-1 lg:grid-cols-6 gap-2">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="이름 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
        </div>
        <div className="lg:col-span-1">
          <Input placeholder="회원코드" className="bg-white border-gray-200" />
        </div>
        <div className="lg:col-span-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-gray-200 w-full">
              <SelectValue placeholder="방문용" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="활성">활성</SelectItem>
              <SelectItem value="휴면">휴면</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="lg:col-span-1">
          <Input placeholder="교실" className="bg-white border-gray-200" />
        </div>
        <div className="lg:col-span-1">
          <Input placeholder="그룹" className="bg-white border-gray-200" />
        </div>
      </div>

      {/* 검색 버튼 및 필터 태그 */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-b border-gray-200">
        <Button
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          <Search className="h-4 w-4 mr-2" />
          검색
        </Button>
        <Button
          variant="outline"
          className="border-gray-200 text-gray-700 bg-white"
        >
          초기화
        </Button>
        {statusFilter !== "all" && (
          <Badge
            className="bg-gray-100 text-gray-800 hover:bg-gray-100 gap-1 items-center flex cursor-pointer"
            onClick={removeFilter}
          >
            상태: {statusFilter} <X className="h-3 w-3" />
          </Badge>
        )}
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b border-transparent h-10">
            <TabsTrigger
              value="고객 목록"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-10 px-4 font-medium"
            >
              고객 목록
            </TabsTrigger>
            <TabsTrigger
              value="등록자 현황"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-10 px-4 font-medium"
            >
              등록자 현황
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 페이지네이션 정보 */}
      <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
        <div>0-0 / 0</div>
        <div className="flex items-center gap-1">
          <span className="font-medium">1</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-12 px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200 bg-white">
        <div className="col-span-1">회원코드</div>
        <div className="col-span-1">이름(한글)</div>
        <div className="col-span-1">이름(한자)</div>
        <div className="col-span-1">상태</div>
        <div className="col-span-1">수강 코스</div>
        <div className="col-span-1">교실</div>
        <div className="col-span-1">그룹</div>
        <div className="col-span-1">담당 의사</div>
        <div className="col-span-1">전화번호</div>
        <div className="col-span-1">나이</div>
        <div className="col-span-1">등록일</div>
        <div className="col-span-1"></div>
      </div>

      {/* 테이블 본문 */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
          <p className="ml-2 text-sm text-gray-500">
            데이터를 불러오는 중입니다...
          </p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
          <div className="w-16 h-16 mb-4 border-2 border-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-200">?</span>
          </div>
          <p>No data</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => handleViewDetails(customer.id)}
              className="grid grid-cols-12 px-4 py-3 text-sm border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <div className="col-span-1">{customer.id}</div>
              <div className="col-span-1 font-medium">{customer.name}</div>
              <div className="col-span-1">{customer.nameHanja || "-"}</div>
              <div className="col-span-1">
                <Badge
                  className={
                    customer.status === "활성"
                      ? "bg-green-50 text-green-700 hover:bg-green-50"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  }
                >
                  {customer.status}
                </Badge>
              </div>
              <div className="col-span-1">{customer.course || "-"}</div>
              <div className="col-span-1">{customer.classroom || "-"}</div>
              <div className="col-span-1">{customer.group || "-"}</div>
              <div className="col-span-1">{customer.doctor || "-"}</div>
              <div className="col-span-1">{customer.phone}</div>
              <div className="col-span-1">{customer.age || "-"}</div>
              <div className="col-span-1">{customer.registeredDate || "-"}</div>
              <div className="col-span-1"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerPage;
