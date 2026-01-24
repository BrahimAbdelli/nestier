import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ValidateObjectIdPipe } from '@shared/common/pipes';
import { UserService } from '../../application/services/user.service';
import { User } from '../../domain/value-objects/user';
import { UserLogin } from '../../domain/value-objects/user-login';
import { UserUpdatePassword } from '../../domain/value-objects/user-update-password';
import { CreateUserDto, UpdateNewPasswordDto, UpdateUserDto, UserLoginDto, UserLoginResponseDto, UserResponseDto } from '../dtos';
import { FindAndSearchUserResponseDto } from '../dtos/find-and-search-user-response.dto';
import { UserDto } from '../dtos/user.dto';
import { UserDtoMapper } from '../mappers/user-dto.mapper';
import { ObjectId } from 'mongodb';

@Controller('users')
@ApiTags('users')
@ApiNotFoundResponse({ description: 'User not found' })
@ApiBadRequestResponse({ description: 'Invalid request data' })
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userDtoMapper: UserDtoMapper
  ) { }

  @Get('')
  @ApiOperation({ summary: 'Get all active users' })
  @ApiOkResponse({ description: 'List of active users', type: [FindAndSearchUserResponseDto] })
  public async findAll(): Promise<FindAndSearchUserResponseDto[]> {
    const users: User[] = await this.userService.findAll();
    return this.userDtoMapper.domainsToFindAndSearchDtos(users);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Find user by email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiOkResponse({ description: 'User found', type: UserDto })
  public async findByEmail(@Param() params): Promise<UserDto> {
    const user: User = await this.userService.findByEmail(params.email);
    return this.userDtoMapper.domainToDto(user);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Find user by username' })
  @ApiParam({ name: 'username', description: 'Username to search' })
  @ApiOkResponse({ description: 'User found', type: UserDto })
  public async findByUsername(@Param() params): Promise<UserDto> {
    const user: User = await this.userService.findByUsername(params.username);
    return this.userDtoMapper.domainToDto(user);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiParam({ name: 'id', description: 'User ObjectId' })
  @ApiOkResponse({ description: 'User found', type: UserDto })
  public async findById(@Param(new ValidateObjectIdPipe('User')) id): Promise<UserDto> {
    const user: User = await this.userService.findOneById(id);
    return this.userDtoMapper.domainToDto(user);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and get JWT token' })
  @ApiBody({ type: UserLoginDto })
  @ApiOkResponse({ description: 'Login successful', type: UserLoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  public async login(@Body() loginUserDto: UserLoginDto): Promise<UserLoginResponseDto> {
    const userLogin: UserLogin = this.userDtoMapper.loginDtoToDomain(loginUserDto);
    const user: User = await this.userService.login(userLogin);
    return this.userDtoMapper.domainToUserLoginResponseDto(user);
  }

  @Post('forgot-password/:email')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiCreatedResponse({ description: 'Password reset email sent', type: UserResponseDto })
  public async forgotPassword(@Param() params): Promise<UserResponseDto> {
    const user: User = await this.userService.forgotPassword(params.email);
    return this.userDtoMapper.domainToUserResponseDto(user);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: UpdateNewPasswordDto })
  @ApiCreatedResponse({ description: 'Password reset successful', type: UserResponseDto })
  public async updateNewPassword(@Body() updateNewPasswordDto: UpdateNewPasswordDto): Promise<UserResponseDto> {
    const userUpdatePassword: UserUpdatePassword = this.userDtoMapper.updatePasswordDtoToDomain(updateNewPasswordDto);
    const user: User = await this.userService.updateNewPassword(userUpdatePassword);
    return this.userDtoMapper.domainToUserResponseDto(user);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'User created successfully' })
  public async create(@Body() userData: CreateUserDto): Promise<void> {
    const user: User = this.userDtoMapper.createDtoToDomain(userData);
    await this.userService.create(user);
  }

  @Put('user/:id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User ObjectId' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'User updated', type: UserDto })
  public async update(
    @Param(new ValidateObjectIdPipe('User')) id: ObjectId,
    @Body() userData: UpdateUserDto
  ): Promise<UserDto> {
    const user: User = this.userDtoMapper.updateDtoToDomain(userData);
    user._id = id;
    const updatedUser: User = await this.userService.update(user);
    return this.userDtoMapper.domainToDto(updatedUser);
  }

  @Patch('archive/:id')
  @ApiOperation({ summary: 'Archive (soft delete) a user' })
  @ApiParam({ name: 'id', description: 'User ObjectId' })
  @ApiOkResponse({ description: 'User archived successfully' })
  public async archive(@Param(new ValidateObjectIdPipe('User')) id: ObjectId): Promise<void> {
    await this.userService.archive(id);
  }

  @Patch('unarchive/:id')
  @ApiOperation({ summary: 'Unarchive a user' })
  @ApiParam({ name: 'id', description: 'User ObjectId' })
  @ApiOkResponse({ description: 'User unarchived successfully' })
  public async unarchive(@Param(new ValidateObjectIdPipe('User')) id: ObjectId): Promise<void> {
    await this.userService.unarchive(id);
  }
}
