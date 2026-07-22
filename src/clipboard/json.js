/**
 * JSON clipboard payload including extraction metadata.
 * @param {ReturnType<typeof import('../listing/record.js').createListingRecord>} record
 * @returns {string}
 */
export function formatListingJson(record) {
  const payload = {
    source: record.source,
    vehicle: {
      plate: record.fields.plate,
      make: record.fields.make,
      model: record.fields.model,
      year: record.fields.year,
      mileageKm: record.fields.mileageKm,
      transmission: record.fields.transmission,
      fuel: record.fields.fuel,
      engine: record.fields.engine,
      powerCv: record.fields.powerCv,
    },
    valuation: {
      paintParts: record.fields.paintParts,
      bodyParts: record.fields.bodyParts,
      tires: record.fields.tires,
      customerValueEur: record.fields.customerValueEur,
      saleReason: record.fields.saleReason,
      keyCount: record.fields.keyCount,
      deductibleVat: record.fields.deductibleVat,
    },
    url: record.fields.url,
    origins: record.origins,
    metadata: record.metadata,
  };
  return JSON.stringify(payload, null, 2);
}
