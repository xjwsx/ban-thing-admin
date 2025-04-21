import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTodoStore from "../stores/todoStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { DatePicker } from "../components/ui/date-picker";
import { Label } from "../components/ui/label";
import { NotionHeader, NotionSection } from "../components/NotionLayout";

const HomeRegisterPage = () => {
  const navigate = useNavigate();
  const addTodo = useTodoStore((state) => state.addTodo);
  const [formValues, setFormValues] = useState({
    title: "",
    date: null,
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormValues((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formValues.title || !formValues.date) {
      return;
    }
    
    const newTodo = {
      title: formValues.title,
      date: formValues.date,
      description: formValues.description,
    };
    
    console.log("Adding todo:", newTodo);
    addTodo(newTodo);
    navigate("/home");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <NotionHeader
          title="할 일 추가"
          description="새로운 할 일을 등록합니다"
        />
        
        <NotionSection>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                placeholder="할 일 제목을 입력하세요"
                value={formValues.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">날짜</Label>
              <DatePicker
                value={formValues.date}
                onChange={handleDateChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="상세 설명을 입력하세요"
                rows={4}
                value={formValues.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/home")}
              >
                취소
              </Button>
              <Button type="submit">저장</Button>
            </div>
          </form>
        </NotionSection>
      </div>
    </div>
  );
};

export default HomeRegisterPage;
