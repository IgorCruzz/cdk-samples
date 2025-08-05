type QueryStep = Record<string, object>;

export type QueryBuilder = {
  match: (data: object) => QueryBuilder;
  group: (data: object) => QueryBuilder;
  sort: (data: object) => QueryBuilder;
  unwind: (data: object) => QueryBuilder;
  lookup: (data: object) => QueryBuilder;
  project: (data: object) => QueryBuilder;
  limit: (data: number) => QueryBuilder;
  skip: (data: number) => QueryBuilder;
  count: () => QueryBuilder;
  facet: (data: Record<string, QueryStep[]>) => QueryBuilder;
  build: () => QueryStep[];
};

export const queryBuilder = (query: QueryStep[] = []): QueryBuilder => {
  const addStep = (step: string, data: any): QueryBuilder => {
    return queryBuilder([...query, { [step]: data }]);
  };

  return {
    match: (data) => addStep("$match", data),
    group: (data) => addStep("$group", data),
    sort: (data) => addStep("$sort", data),
    unwind: (data) => addStep("$unwind", data),
    lookup: (data) => addStep("$lookup", data),
    project: (data) => addStep("$project", data),
    limit: (data) => addStep("$limit", data),
    skip: (data) => addStep("$skip", data),
    count: () => addStep("$count", "total"),

    facet: (data) => {
      const facetObject: Record<string, QueryStep[]> = {};
      for (const key in data) {
        facetObject[key] = data[key];
      }
      return addStep("$facet", facetObject);
    },

    build: () => query,
  };
};
