import * as userRepo from '../repositories/user.repository';

export async function getUsers() {
  return userRepo.findAll();
}
