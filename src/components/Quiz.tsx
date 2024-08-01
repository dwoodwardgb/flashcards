import { createSignal, Show, For, onMount } from "solid-js";
import { Word } from "./WordForm";

function randomComparator<T>(_a: T, _b: T): number {
  return Math.random() >= 0.5 ? 1 : -1;
}

function getQuizConfigFromQueryParams() {
  const params = new URLSearchParams(window?.location?.search);
  return {
    shown: params.getAll("shown"),
    guessed: params.getAll("guessed"),
  };
}

function checkWord(expected: Word, actual: Partial<Word>): undefined | string {
  for (let k of Object.keys(actual)) {
    if (actual[k]) {
      if (actual[k].trim().toLowerCase() !== expected[k].trim().toLowerCase()) {
        return "Incorrect!";
      }
    }
  }
  return undefined;
}

export function Quiz() {
  const [words, setWords] = createSignal<Word[]>([]);
  const [index, setIndex] = createSignal<number>(0);
  const [config, setConfig] = createSignal<
    { shown: string[]; guessed: string[] } | undefined
  >(undefined);

  onMount(() => {
    setWords(JSON.parse(window?.localStorage.getItem("words")) || []);
  });

  onMount(() => {
    setConfig(getQuizConfigFromQueryParams());
  });

  function sortedWords() {
    const list = [...words()];
    list.sort(randomComparator);
    return list;
  }

  return (
    <>
      <Show when={index() >= sortedWords().length}>Complete!</Show>
      <Show when={index() >= 0 && index() < sortedWords().length}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = {};
            const elements = event.target["elements"];
            for (let i = 0; i < elements.length; i += 1) {
              const field = elements[i];
              if (field.name) {
                data[field.name] = field.value;
                field.value = "";
              }
            }

            const error = checkWord(
              sortedWords()[index()],
              data as Partial<Word>
            );
            if (error) {
              window.alert(error);
              return;
            }

            setIndex((i) => i + 1);
          }}
        >
          <For each={config().shown}>
            {(field) => (
              <p>
                {field}: {sortedWords()[index()][field]}
              </p>
            )}
          </For>
          <For each={config().guessed}>
            {(field) => (
              <label>
                {field}
                <input
                  class="block p-1 border-black border-solid border"
                  name={field}
                  type="text"
                />
              </label>
            )}
          </For>
          <button
            class="block p-1 border-black border-solid border mt-4"
            type="submit"
          >
            Submit
          </button>
        </form>
      </Show>
    </>
  );
}
