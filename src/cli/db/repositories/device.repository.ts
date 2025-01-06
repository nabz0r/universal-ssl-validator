import { Collection } from 'mongodb';
import { DatabaseManager } from '../index';
import { deviceSchema } from '../schemas';

export class DeviceRepository {
  private collection: Collection;

  constructor() {
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getMongo().db('ssl-validator');
    this.collection = db.collection('devices');
  }

  async create(device: any) {
    await this.collection.insertOne({
      ...device,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async findById(id: string) {
    return this.collection.findOne({ id });
  }

  async findByFleet(fleetId: string) {
    return this.collection.find({ fleet: fleetId }).toArray();
  }

  async updateStatus(id: string, status: string) {
    await this.collection.updateOne(
      { id },
      { 
        $set: { 
          status,
          lastSeen: new Date(),
          updatedAt: new Date()
        } 
      }
    );
  }

  async updateCertificate(id: string, certificate: any) {
    await this.collection.updateOne(
      { id },
      { 
        $set: { 
          certificate,
          updatedAt: new Date()
        } 
      }
    );
  }

  async delete(id: string) {
    await this.collection.deleteOne({ id });
  }
}