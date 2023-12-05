import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user } from 'src/entities';
import { Repository } from 'typeorm';
import { SignUpUserDto } from './dto/signup.user.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(user) private readonly userRepository: Repository<user>,
  ) {}

  async signup(signupDto: SignUpUserDto): Promise<user> {
    const { email, username, password } = signupDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedpass = await bcrypt.hashSync(password, salt);

    const newUser = this.userRepository.create({
      email,
      username,
      password: hashedpass,
    });
    return this.userRepository.save(newUser);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(password,user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
