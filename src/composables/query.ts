import type { Ref } from 'vue';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface useRouteQueryTransform<T> {
  fromQuery: (query: string) => T
  toQuery: (value: T) => string
}

export const useRouteQuery = <T>(
  queryName: string,
  defaultValue: T,
  transform?: useRouteQueryTransform<T>,
): Ref<T> => {
  const route = useRoute();
  const router = useRouter();

  const fromQuery = transform?.fromQuery ?? ((query: string) => query as unknown as T);
  const toQuery = transform?.toQuery ?? ((value: T) => value as unknown as string);

  const queryValue = route.query[queryName] as string;
  const routeQueryRef = ref<T>(fromQuery(queryValue) ?? defaultValue);

  watch(
    routeQueryRef,
    (value) => {
      const { params, query, hash } = route;
      const newQuery = { ...query };
      const newQueryValue = toQuery(value);
      if (!newQueryValue || value === defaultValue) {
        delete newQuery[queryName];
      }
      else {
        newQuery[queryName] = newQueryValue;
      }
      router.replace({
        params,
        query: newQuery,
        hash,
      });
    },
  );

  watch(
    () => route.query[queryName],
    (query) => {
      routeQueryRef.value = fromQuery(query as string);
    },
  );

  return routeQueryRef as Ref<T>;
};
