import { profile } from './profile.entity';
import { restaurant } from './restaurant.entity';
import { table } from './table.entity';
import { user_clients } from './user_client.entity';
import { user_restaurant } from './user_restaurant.entity';
import { reservation } from './reservation.entity';

const entities = [
  user_clients,
  profile,
  user_restaurant,
  table,
  restaurant,
  reservation,
];

export { user_clients, profile, user_restaurant, table, restaurant };

export default entities;
