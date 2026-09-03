import { createInward, createOutward } from "../services/stockService.js";
import { transactionRepository } from "../repositories/transactionRepository.js";

export async function getTransactions(request, response) {
  const filter = {};

  if (request.query.kind) filter.kind = request.query.kind;
  if (request.query.itemCode) {
    filter.itemCode = request.query.itemCode.toUpperCase();
  }

  if (request.query.from || request.query.to) {
    filter.transactionDate = {
      ...(request.query.from && { $gte: new Date(request.query.from) }),
      ...(request.query.to && { $lte: new Date(request.query.to) }),
    };
  }

  response.json(await transactionRepository.findAll(filter));
}

export async function saveInward(request, response) {
  response.status(201).json(await createInward(request.body));
}

export async function saveOutward(request, response) {
  response.status(201).json(await createOutward(request.body));
}
