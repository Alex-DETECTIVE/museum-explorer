import { Museum } from './types';

// Координаты центра Тюмени
export const INITIAL_MAP_VIEW = {
  lat: 57.1522,
  lng: 65.5272,
  zoom: 14
};

export const MUSEUMS: Museum[] = [
  {
    id: 'slovtsov',
    name: 'Музейный комплекс им. И.Я. Словцова',
    rating: 4.8,
    reviewCount: 1540,
    coordinates: { lat: 57.1540095, lng: 65.5499624 },
    address: 'ул. Советская, 63, Тюмень',
    hours: 'Вт-Вс: 11:00-20:00',
    price: 'Взрослый: 300₽ | Льготный: 150₽',
    icon: '🏛️',
    themes: [
      {
        id: 'rus_art',
        title: 'Шедевры художественной коллекции',
        description: '',
        photos: [
          { url: 'assets/шедевры художественной коллекции.jpg', caption: '' },
          { url: 'assets/шедевры художественной коллекции (1).jpg', caption: '' },
          { url: 'assets/шедевры художественной коллекции (2).jpg', caption: '' },
          { url: 'assets/шедевры художественной коллекции (3).jpg', caption: '' },
          { url: 'assets/шедевры художественной коллекции (4).jpg', caption: '' },
          { url: 'assets/шедевры художественной коллекции (5).jpg', caption: '' },
        ]
      },
      {
        id: 'carpets',
        title: 'Сибирский махровый ковер',
        description: '',
        photos: [
          { url: 'assets/Сибирский махровый ковер (1).jpg', caption: '' },
          { url: 'assets/Сибирский махровый ковер (2).jpg', caption: '' },
          { url: 'assets/Сибирский махровый ковер (3).jpg', caption: '' },
          { url: 'assets/Сибирский махровый ковер (4).jpg', caption: '' },
          { url: 'assets/Сибирский махровый ковер (5).jpg', caption: '' },
        ]
      },
      {
        id: 'rodina',
        title: 'Именем родины',
        description: '',
        photos: [
          { url: 'assets/именем родины (1).jpg', caption: '' },
          { url: 'assets/именем родины (2).jpg', caption: '' },
          { url: 'assets/именем родины (3).jpg', caption: '' },
          { url: 'assets/именем родины (4).jpg', caption: '' },
          { url: 'assets/именем родины (5).jpg', caption: '' },
        ]
      }
    ]
  },
  {
    id: 'duma',
    name: 'Музей «Городская Дума»',
    rating: 4.7,
    reviewCount: 980,
    coordinates: { lat: 57.1611, lng: 65.5218 },
    address: 'ул. Ленина, 2, Тюмень',
    hours: 'Ежедневно: 10:00-18:00',
    price: 'Взрослый: 200₽ | Детский: 100₽',
    icon: '🏛️',
    themes: [
      {
        id: 'paleo',
        title: 'Палеонтологическая коллекция региона',
        description: '',
        photos: [
          { url: 'assets/Палеонтологическая коллекция региона (1).jpg', caption: '' },
          { url: 'assets/Палеонтологическая коллекция региона (2).jpg', caption: '' },
        ]
      },
      {
        id: 'local_nature',
        title: 'Природа Тюменского края',
        description: '',
        photos: [
          { url: 'assets/Природа тюменского края (1).jpg', caption: '' },
          { url: 'assets/Природа тюменского края (2).jpg', caption: '' },
          { url: 'assets/Природа тюменского края (3).jpg', caption: '' },
          { url: 'assets/Природа тюменского края (4).jpg', caption: '' },
          { url: 'assets/Природа тюменского края (5).jpg', caption: '' },
        ]
      }
    ]
  },
  {
    id: 'history',
    name: 'История России',
    rating: 4.6,
    reviewCount: 650,
    coordinates: { lat: 57.1531249, lng: 65.5484891 },
    address: 'ул. Орджоникидзе, 47, Тюмень',
    hours: 'Вт-Вс: 11:00-20:00',
    price: 'Взрослый: 250₽ | Студенты: 150₽',
    icon: '🍵',
    themes: [
      {
        id: 'merchants',
        title: 'Археологические находки быт наших предков',
        description: '',
        photos: [
          { url: 'assets/Археологические находки быт наших предков (1).jpg', caption: '' },
          { url: 'assets/Археологические находки быт наших предков (2).jpg', caption: '' },
          { url: 'assets/Археологические находки быт наших предков (3).jpg', caption: '' },
          { url: 'assets/Археологические находки быт наших предков (4).jpg', caption: '' },
        ]
      },
      {
        id: 'royal_visit',
        title: 'Спираль времени сквозь объективы камер',
        description: '',
        photos: [
          { url: 'assets/Спираль времени (1).jpg', caption: '' },
          { url: 'assets/Спираль времени (2).jpg', caption: '' },
          { url: 'assets/Спираль времени (3).jpg', caption: '' },
          { url: 'assets/Спираль времени (4).jpg', caption: '' },
        ]
      },
      {
        id: 'royal_visit',
        title: 'Эпоха испытаний: мультимедийная реконструкция событий',
        description: '',
        photos: [
          { url: 'assets/Эпоха испытаний (1).jpg', caption: '' },
          { url: 'assets/Эпоха испытаний (2).jpg', caption: '' },
          { url: 'assets/Эпоха испытаний (3).jpg', caption: '' },
          { url: 'assets/Эпоха испытаний (4).jpg', caption: '' },
        ]
      }
    ]
  }
];