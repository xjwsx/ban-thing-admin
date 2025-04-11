import { create } from "zustand";

const useTodoStore = create((set) => ({
  todos: [],
  minutes: [],
  selectedStudent: null,

  // 회의록 추가
  addMinutes: (minutesData) =>
    set((state) => ({
      minutes: [
        ...state.minutes,
        { id: Date.now().toString(), ...minutesData },
      ],
    })),

  // 회의록 수정
  updateMinutes: (minutesData) =>
    set((state) => ({
      minutes: state.minutes.map((item) =>
        item.id === minutesData.id ? { ...item, ...minutesData } : item
      ),
    })),

  // 회의록 삭제
  deleteMinutes: (minutesId) =>
    set((state) => ({
      minutes: state.minutes.filter((item) => item.id !== minutesId),
    })),

  // 기존 할일 관련 메서드들...
  addTask: ({ studentId, status, ...taskData }) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [studentId]: {
          ...state.tasks[studentId],
          [status]: [
            ...(state.tasks[studentId]?.[status] || []),
            { id: Date.now().toString(), ...taskData },
          ],
        },
      },
    })),

  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, { ...todo, id: Date.now() }],
    })),
  updateTodo: (updatedTodo) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      ),
    })),
  deleteTodo: (todoId) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== todoId),
    })),

  tasks: {
    1: {
      todo: [
        { id: "task-1-1", content: "일본어 숙제 확인" },
        { id: "task-1-2", content: "다음 수업 준비" },
      ],
      inProgress: [{ id: "task-1-3", content: "테스트 채점" }],
      done: [{ id: "task-1-4", content: "수업 자료 준비" }],
    },
  },
  selectedStudent: "1",

  setSelectedStudent: (studentId) => set({ selectedStudent: studentId }),

  addTask: ({
    studentId,
    status,
    title,
    author,
    content,
    meetingDate,
    createdDate,
  }) =>
    set((state) => {
      const newTask = {
        id: `task-${Date.now()}`,
        title,
        author,
        content,
        meetingDate,
        createdDate,
      };

      const studentTasks = state.tasks[studentId] || {
        minutes: [],
        todo: [],
        inProgress: [],
        done: [],
      };

      return {
        tasks: {
          ...state.tasks,
          [studentId]: {
            ...studentTasks,
            [status]: [...(studentTasks[status] || []), newTask],
          },
        },
      };
    }),

  updateTask: ({
    id,
    title,
    author,
    content,
    oldStatus,
    newStatus,
    meetingDate,
    createdDate,
  }) =>
    set((state) => {
      const studentId = state.selectedStudent;
      const studentTasks = state.tasks[studentId];

      if (!studentTasks || !studentTasks[oldStatus]) return state;

      if (oldStatus === newStatus) {
        const updatedTasks = studentTasks[oldStatus].map((task) =>
          task.id === id
            ? {
                ...task,
                title,
                author,
                content,
                meetingDate,
                createdDate,
              }
            : task
        );

        return {
          tasks: {
            ...state.tasks,
            [studentId]: {
              ...studentTasks,
              [oldStatus]: updatedTasks,
            },
          },
        };
      }

      const updatedOldStatusTasks = studentTasks[oldStatus].filter(
        (task) => task.id !== id
      );

      const updatedTask = {
        id,
        title,
        author,
        content,
        meetingDate,
        createdDate,
      };

      const updatedNewStatusTasks = [
        ...(studentTasks[newStatus] || []),
        updatedTask,
      ];

      return {
        tasks: {
          ...state.tasks,
          [studentId]: {
            ...studentTasks,
            [oldStatus]: updatedOldStatusTasks,
            [newStatus]: updatedNewStatusTasks,
          },
        },
      };
    }),

  moveTask: ({ studentId, source, destination }) =>
    set((state) => {
      const studentTasks = state.tasks[studentId];

      if (!studentTasks) return state;

      const sourceColumn = studentTasks[source.droppableId];
      const destColumn = studentTasks[destination.droppableId];

      if (source.droppableId === destination.droppableId) {
        const newTasks = Array.from(sourceColumn);
        const [removed] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, removed);

        return {
          tasks: {
            ...state.tasks,
            [studentId]: {
              ...studentTasks,
              [source.droppableId]: newTasks,
            },
          },
        };
      } else {
        const sourceTasks = Array.from(sourceColumn);
        const destTasks = Array.from(destColumn);
        const [removed] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, removed);

        return {
          tasks: {
            ...state.tasks,
            [studentId]: {
              ...studentTasks,
              [source.droppableId]: sourceTasks,
              [destination.droppableId]: destTasks,
            },
          },
        };
      }
    }),

  deleteTask: ({ studentId, status, taskId }) =>
    set((state) => {
      const studentTasks = state.tasks[studentId];
      if (!studentTasks || !studentTasks[status]) return state;

      return {
        tasks: {
          ...state.tasks,
          [studentId]: {
            ...studentTasks,
            [status]: studentTasks[status].filter((task) => task.id !== taskId),
          },
        },
      };
    }),
}));

export default useTodoStore;
