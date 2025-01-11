export type TCarparkInfo = {
  lot_type: string;
  lots_available: string;
  total_lots: string;
};

export type TAvailability = {
  carpark_info: TCarparkInfo[];
  carpark_number: string;
  update_datetime: string;
};

export type TCoordinate = [number, number];

export type TCarpark = {
  address: string;
  car_park_basement: string;
  car_park_decks: string;
  car_park_no: string;
  car_park_type: string;
  free_parking: string;
  gantry_height: string;
  night_parking: string;
  short_term_parking: string;
  type_of_parking_system: string;
  x_coord: string;
  y_coord: string;
  availabilities?: TAvailability;
  coordinate: TCoordinate;
};
