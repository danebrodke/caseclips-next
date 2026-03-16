export interface Institution {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string;
  photoUrl: string;
  institutionId: string;
}

export interface Specialty {
  id: string;
  name: string;
  slug: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  vimeoId: string;
  thumbnailUrl: string;
  preopImages: string[];
  postopImages: string[];
  authorIds: string[];
  specialtyIds: string[];
  publishedAt: string;
}
