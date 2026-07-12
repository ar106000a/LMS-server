export interface CreateLessonDto {
  title: string;
  type: "VIDEO" | "ARTICLE";
  isPreview: boolean;
}
