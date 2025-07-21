type QueryStep = Record<string, object>;

export type QueryBuilderType = {
  match: (data: object) => QueryBuilderType;
  group: (data: object) => QueryBuilderType;
  sort: (data: object) => QueryBuilderType;
  unwind: (data: object) => QueryBuilderType;
  lookup: (data: object) => QueryBuilderType;
  project: (data: object) => QueryBuilderType;
  build: () => QueryStep[];
};

const createQueryBuilder = (steps: QueryStep[] = []): QueryBuilderType => {
  const addStep = (step: string, data: object): QueryBuilderType => {
    return createQueryBuilder([...steps, { [step]: data }]);
  };

  return {
    match: (data) => addStep("$match", data),
    group: (data) => addStep("$group", data),
    sort: (data) => addStep("$sort", data),
    unwind: (data) => addStep("$unwind", data),
    lookup: (data) => addStep("$lookup", data),
    project: (data) => addStep("$project", data),
    build: () => steps,
  };
};

export { createQueryBuilder };
