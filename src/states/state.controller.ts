import { Controller, Get, Param } from '@nestjs/common';
import { StateService } from './state.service';

@Controller('states')
export class StateController {
  constructor(private readonly stateService) {}

  @Get('rollbackto/:id')
  async rollbacktoId(@Param('id') id: number) {
    }

  @Get('save-state')
  saveState() {
    }
}
