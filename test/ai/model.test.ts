import { createModel, trainModel, saveModel, loadModel } from '../../src/ai/model/model';
import * as tf from '@tensorflow/tfjs';

describe('AI Model', () => {
  let model: tf.LayersModel;

  beforeAll(async () => {
    model = await createModel();
  });

  it('should create a model with correct shape', () => {
    expect(model.inputs[0].shape).toEqual([null, 5]);
    expect(model.outputs[0].shape).toEqual([null, 4]);
  });

  it('should train on sample data', async () => {
    const sampleData = [
      {
        notBefore: new Date('2023-01-01'),
        notAfter: new Date('2024-01-01'),
        issuer: 'DigiCert',
        algorithm: 'RSA',
        keyLength: 2048,
        hasExpired: false,
        hasVulnerabilities: false,
        issuerTrustScore: 0.95,
        overallScore: 0.9
      },
      {
        notBefore: new Date('2022-01-01'),
        notAfter: new Date('2023-01-01'),
        issuer: 'Lets Encrypt',
        algorithm: 'ECDSA',
        keyLength: 4096,
        hasExpired: true,
        hasVulnerabilities: false,
        issuerTrustScore: 0.85,
        overallScore: 0.8
      }
    ];

    const history = await trainModel(model, sampleData, 5);
    expect(history.history.loss.length).toBe(5);
    expect(history.history.acc[4]).toBeGreaterThan(0.5);
  });

  it('should save and load model', async () => {
    const tempPath = '/tmp/ssl-validator-model';
    
    await saveModel(model, tempPath);
    const loadedModel = await loadModel(tempPath);
    
    expect(loadedModel.inputs[0].shape).toEqual(model.inputs[0].shape);
    expect(loadedModel.outputs[0].shape).toEqual(model.outputs[0].shape);
  });

  it('should make predictions', async () => {
    const testInput = tf.tensor2d([
      [0.5, 1.5, 2, 1, 0.5] // Données de test normalisées
    ]);

    const prediction = model.predict(testInput) as tf.Tensor;
    const values = await prediction.array();

    expect(values[0].length).toBe(4);
    values[0].forEach(value => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
  });
});