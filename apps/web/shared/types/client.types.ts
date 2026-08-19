/**
 * Client types for showcase hero
 */

export interface ClientLocation {
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Client {
  id: string;
  name: string;
  location: ClientLocation;
  images: string[]; // Array of image URLs
  description: string;
  serviceType: string;
  completedDate?: string;
}

export interface ClientShowcaseProps {
  clients: Client[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  mapStyle?: string;
  className?: string;
}

