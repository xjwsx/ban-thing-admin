import React, { useState } from "react";
import { 
  NotionContainer, 
  NotionHeader, 
  NotionPage, 
  NotionSection, 
} from "../components/NotionLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "../components/ui/card";
import { Search, Plus, Eye, Edit, Trash2, Calendar } from "lucide-react";

// 샘플 데이터
const NOTICES = [
  { 
    id: 1, 
    title: "8월 운영 시간 변경 안내", 
    content: "8월 15일부터 운영 시간이 오전 8시부터 오후 9시까지로 변경됩니다. 회원님들의 많은 양해 부탁드립니다.", 
    author: "관리자", 
    date: "2023-08-01", 
    isImportant: true,
    views: 120
  },
  { 
    id: 2, 
    title: "여름 특별 프로그램 안내", 
    content: "8월 한 달간 여름 특별 프로그램을 운영합니다. 자세한 내용은 공지사항을 확인해주세요.", 
    author: "김지연", 
    date: "2023-07-28", 
    isImportant: false,
    views: 85
  },
  { 
    id: 3, 
    title: "시설 점검 안내", 
    content: "8월 5일 오전 10시부터 오후 2시까지 시설 점검으로 인해 일부 수업이 취소될 예정입니다.", 
    author: "관리자", 
    date: "2023-07-25", 
    isImportant: true,
    views: 100
  },
  { 
    id: 4, 
    title: "신규 강사 소개", 
    content: "8월부터 새로운 요가 강사 두 분이 저희 스튜디오에 합류합니다. 많은 관심 부탁드립니다.", 
    author: "김지연", 
    date: "2023-07-20", 
    isImportant: false,
    views: 92
  },
  { 
    id: 5, 
    title: "회원권 가격 조정 안내", 
    content: "9월 1일부터 회원권 가격이 소폭 조정될 예정입니다. 기존 회원님들은 기존 가격으로 유지됩니다.", 
    author: "관리자", 
    date: "2023-07-15", 
    isImportant: true,
    views: 130
  }
];

const NoticesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [notices, setNotices] = useState(NOTICES);
  const [filter, setFilter] = useState("all"); // all, important

  const filteredNotices = notices
    .filter(notice => 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter === "all" || (filter === "important" && notice.isImportant))
    );

  const deleteNotice = (id) => {
    if (window.confirm("이 공지사항을 삭제하시겠습니까?")) {
      setNotices(notices.filter(notice => notice.id !== id));
    }
  };

  return (
    <NotionContainer>
      <NotionHeader 
        title="공지사항" 
        description="자라다 회원님들을 위한 공지사항 관리 페이지입니다."
      />
      
      <NotionPage>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="공지사항 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-accent" : ""}
              >
                전체
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setFilter("important")}
                className={filter === "important" ? "bg-accent" : ""}
              >
                중요 공지
              </Button>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            공지사항 작성
          </Button>
        </div>

        <NotionSection title="주요 공지사항">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {notices.filter(notice => notice.isImportant).slice(0, 3).map(notice => (
              <Card key={notice.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{notice.title}</CardTitle>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      중요
                    </span>
                  </div>
                  <CardDescription className="flex items-center text-xs">
                    <Calendar className="h-3 w-3 mr-1" /> {notice.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3">{notice.content}</p>
                </CardContent>
                <CardFooter className="pt-1 pb-3 border-t flex justify-between text-xs text-muted-foreground">
                  <span>작성자: {notice.author}</span>
                  <span>조회수: {notice.views}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </NotionSection>

        <NotionSection title="전체 공지사항">
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <Card key={notice.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold line-clamp-1">{notice.title}</h3>
                      {notice.isImportant && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          중요
                        </span>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2 mb-4 text-muted-foreground">{notice.content}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {notice.date}
                      </span>
                      <span>작성자: {notice.author}</span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" /> {notice.views}
                      </span>
                    </div>
                  </div>
                  <div className="flex md:flex-col justify-end p-4 md:border-l">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mb-1">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mb-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteNotice(notice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {filteredNotices.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </NotionSection>
      </NotionPage>
    </NotionContainer>
  );
};

export default NoticesPage; 