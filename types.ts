
export interface Member {
  id: string;
  nome: string;
  foto_url: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  nome: string;
  is_admin: boolean;
}

export interface PrayerRequest {
  id: string;
  pedido: string;
  nome_contato: string;
  telefone_contato: string;
  status: 'pendente' | 'atendido';
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  image: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
}
