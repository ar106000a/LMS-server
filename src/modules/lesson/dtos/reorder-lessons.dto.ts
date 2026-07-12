export interface ReorderLessonItem {
  lessonId: string;
  sortOrder: number;
}

export interface ReorderLessonsDto {
  sectionId: string;
  lessons: ReorderLessonItem[];
}
