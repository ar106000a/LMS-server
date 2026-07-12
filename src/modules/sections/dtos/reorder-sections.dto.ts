export interface ReorderSectionItem {
  sectionId: string;
  sortOrder: number;
}

export interface ReorderSectionsDto {
  courseId: string;
  sections: ReorderSectionItem[];
}
