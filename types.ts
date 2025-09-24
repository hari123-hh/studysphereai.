export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  role: Role;
  text: string;
  images?: string[]; // base64 encoded images
}

export interface ImageFile {
  name: string;
  type: string;
  base64: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}