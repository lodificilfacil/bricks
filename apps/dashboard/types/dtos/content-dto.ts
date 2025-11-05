export type ContentCardDto = {
  id: string;
  title: string;
  type: 'course' | 'microlearning';
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    image?: string | null;
  };
};
