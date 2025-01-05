import * as tf from '@tensorflow/tfjs';

export async function createModel(): Promise<tf.LayersModel> {
  const model = tf.sequential();

  // Couche d'entrée
  model.add(tf.layers.dense({
    inputShape: [5], // date début, date fin, émetteur, algorithme, longueur clé
    units: 64,
    activation: 'relu'
  }));

  // Couches cachées
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu'
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Couche de sortie
  model.add(tf.layers.dense({
    units: 4, // risque expiration, risque vulnérabilité, confiance émetteur, score global
    activation: 'sigmoid'
  }));

  // Compilation
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

export async function trainModel(model: tf.LayersModel, data: any[], epochs: number = 50): Promise<tf.History> {
  const trainData = data.map(cert => ([
    normalizeDate(cert.notBefore),
    normalizeDate(cert.notAfter),
    encodeIssuer(cert.issuer),
    encodeAlgorithm(cert.algorithm),
    encodeKeyLength(cert.keyLength)
  ]));

  const trainLabels = data.map(cert => ([
    cert.hasExpired ? 1 : 0,
    cert.hasVulnerabilities ? 1 : 0,
    cert.issuerTrustScore,
    cert.overallScore
  ]));

  const xs = tf.tensor2d(trainData);
  const ys = tf.tensor2d(trainLabels);

  return await model.fit(xs, ys, {
    epochs,
    validationSplit: 0.2,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
      }
    }
  });
}

export async function saveModel(model: tf.LayersModel, path: string): Promise<void> {
  await model.save(`file://${path}`);
}

export async function loadModel(path: string): Promise<tf.LayersModel> {
  return await tf.loadLayersModel(`file://${path}`);
}

// Fonctions utilitaires
function normalizeDate(date: Date): number {
  const now = new Date().getTime();
  const certDate = new Date(date).getTime();
  return (certDate - now) / (1000 * 60 * 60 * 24 * 365); // Années
}

function encodeIssuer(issuer: string): number {
  const knownIssuers = new Map([
    ['Lets Encrypt', 1],
    ['DigiCert', 2],
    ['Sectigo', 3],
    ['GlobalSign', 4],
    ['Comodo', 5]
  ]);
  return knownIssuers.get(issuer) || 0;
}

function encodeAlgorithm(algo: string): number {
  const algorithms = new Map([
    ['RSA', 1],
    ['ECDSA', 2],
    ['Ed25519', 3],
    ['DSA', 4]
  ]);
  return algorithms.get(algo) || 0;
}

function encodeKeyLength(length: number): number {
  return length / 4096; // Normalisation
}