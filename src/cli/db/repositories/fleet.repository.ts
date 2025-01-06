import { Collection } from 'mongodb';
import { DatabaseManager } from '../index';
import { fleetSchema } from '../schemas';

export class FleetRepository {
  private collection: Collection;

  constructor() {
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getMongo().db('ssl-validator');
    this.collection = db.collection('fleets');
  }

  async create(fleet: any) {
    await this.collection.insertOne({
      ...fleet,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async findById(id: string) {
    return this.collection.findOne({ id });
  }

  async findAll() {
    return this.collection.find().toArray();
  }

  async updateConfig(id: string, config: any) {
    await this.collection.updateOne(
      { id },
      { 
        $set: { 
          config,
          updatedAt: new Date()
        } 
      }
    );
  }

  async delete(id: string) {
    await this.collection.deleteOne({ id });
  }
}