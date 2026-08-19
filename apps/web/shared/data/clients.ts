/**
 * Example client data for showcase
 * 10 clients across South India
 */

import { Client } from '../types/client.types';

export const clients: Client[] = [
  // Hyderabad clients (3)
  {
    id: 'client-1',
    name: 'Tech Park Complex',
    location: {
      address: 'HITEC City',
      city: 'Hyderabad',
      coordinates: { lat: 17.4486, lng: 78.3908 },
    },
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
    ],
    description: 'Complete CCTV installation for 10-story office complex with 200+ cameras and integrated access control system.',
    serviceType: 'CCTV Installation',
    completedDate: '2024-01-15',
  },
  {
    id: 'client-2',
    name: 'Residential Tower',
    location: {
      address: 'Gachibowli',
      city: 'Hyderabad',
      coordinates: { lat: 17.4225, lng: 78.3498 },
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    ],
    description: 'Turnkey electrical contracting for 25-story residential tower including power distribution, lighting, and fire safety systems.',
    serviceType: 'Turnkey Electrical Contracting',
    completedDate: '2024-03-20',
  },
  {
    id: 'client-3',
    name: 'Corporate Headquarters',
    location: {
      address: 'Financial District',
      city: 'Hyderabad',
      coordinates: { lat: 17.4339, lng: 78.3908 },
    },
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
    ],
    description: 'Solar PV installation with 500kW capacity, reducing grid dependency by 60% and providing sustainable energy solution.',
    serviceType: 'Solar PV Projects',
    completedDate: '2024-02-10',
  },
  // Bangalore clients (3)
  {
    id: 'client-4',
    name: 'IT Park',
    location: {
      address: 'Whitefield',
      city: 'Bangalore',
      coordinates: { lat: 12.9698, lng: 77.7499 },
    },
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
    ],
    description: 'Comprehensive networking and structured cabling solution for 15-building IT campus with fiber optic backbone.',
    serviceType: 'Internet & Networking Solutions',
    completedDate: '2024-04-05',
  },
  {
    id: 'client-5',
    name: 'Shopping Mall',
    location: {
      address: 'Koramangala',
      city: 'Bangalore',
      coordinates: { lat: 12.9352, lng: 77.6245 },
    },
    images: [
      'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
    ],
    description: 'Complete fire fighting system installation including fire alarms, sprinklers, and emergency lighting for 5-story shopping complex.',
    serviceType: 'Fire Fighting Work',
    completedDate: '2024-01-30',
  },
  {
    id: 'client-6',
    name: 'Manufacturing Unit',
    location: {
      address: 'Peenya Industrial Area',
      city: 'Bangalore',
      coordinates: { lat: 13.0236, lng: 77.5314 },
    },
    images: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
    ],
    description: 'New site setup with complete electrical infrastructure including power distribution, lighting, and automation systems.',
    serviceType: 'New Site Setup',
    completedDate: '2024-05-12',
  },
  // Chennai clients (2)
  {
    id: 'client-7',
    name: 'Hospital Complex',
    location: {
      address: 'Anna Nagar',
      city: 'Chennai',
      coordinates: { lat: 13.0850, lng: 80.2101 },
    },
    images: [
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    ],
    description: 'Access control and security system installation with biometric access, CCTV integration, and visitor management.',
    serviceType: 'Access Control Solutions',
    completedDate: '2024-03-25',
  },
  {
    id: 'client-8',
    name: 'Educational Institution',
    location: {
      address: 'T. Nagar',
      city: 'Chennai',
      coordinates: { lat: 13.0418, lng: 80.2341 },
    },
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
    ],
    description: 'Renovation work including electrical upgrades, modern lighting systems, and smart classroom automation.',
    serviceType: 'Renovation Work',
    completedDate: '2024-02-18',
  },
  // Vijayawada clients (1)
  {
    id: 'client-9',
    name: 'Commercial Complex',
    location: {
      address: 'Benz Circle',
      city: 'Vijayawada',
      coordinates: { lat: 16.5062, lng: 80.6480 },
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    ],
    description: 'Annual Maintenance Contract (AMC) for electrical systems, fire safety equipment, and security systems.',
    serviceType: 'Annual Maintenance Contract (AMC)',
    completedDate: '2024-06-01',
  },
  // Visakhapatnam clients (1)
  {
    id: 'client-10',
    name: 'Port Authority Building',
    location: {
      address: 'Port Area',
      city: 'Visakhapatnam',
      coordinates: { lat: 17.6868, lng: 83.2185 },
    },
    images: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
    ],
    description: 'MEP projects including complete mechanical, electrical, and plumbing systems for new administrative building.',
    serviceType: 'MEP Projects',
    completedDate: '2024-04-28',
  },
];

