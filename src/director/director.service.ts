import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {

  }

  async findAll() {
    return await this.directorRepository.find();
  }

  async findOne(id: number) {
    const director = await this.directorRepository.findOne({ where: { id } });
    if (!director) {
      throw new NotFoundException('해당 ID의 감독을 찾을수 없습니다.');
    }

    return director;
  }

  async create(createDirectorDto: CreateDirectorDto) {
    const director = await this.directorRepository.save(createDirectorDto);
    return director;
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const director = await this.directorRepository.findOne({
      where: { id }
    });
    if (!director) {
      throw new NotFoundException('해당 ID의 감독을 찾을수 없습니다.');
    }
    await this.directorRepository.update(
      { id },
      {
        ...updateDirectorDto
      },
    );
    const newDirector = this.directorRepository.findOne({ where: { id } });
    return newDirector;
  }

  async remove(id: number) {
    const director = await this.directorRepository.findOne({ where: { id } });
    if (!director) {
      throw new NotFoundException('해당 ID의 감독을 찾을수 없습니다.');
    }
    await this.directorRepository.delete(id);
    return id;
  }
}
