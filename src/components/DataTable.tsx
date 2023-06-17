import { createSignal, For, createEffect, onMount } from "solid-js";
import { Word, WordForm } from "./WordForm";
import { EditableDataCell } from "./DataTableCell";

export function DataTable() {
  const [words, setWords] = createSignal<Word[]>([]);

  onMount(() => {
    setWords(JSON.parse(window?.localStorage.getItem("words")) || []);
  });

  createEffect(() => {
    if (window) {
      window?.localStorage.setItem("words", JSON.stringify(words()));
    }
  });

  return (
    <div role="presentation">
      <div class="mr-16">
        <table class="table-fixed w-full excel-like-table">
          <thead>
            <tr>
              <th class="font-normal">Traditional</th>
              <th class="font-normal">Pinyin</th>
              <th class="font-normal">English</th>
            </tr>
          </thead>
          <tbody>
            <For each={words()}>
              {(w) => (
                <tr>
                  <td class="border border-solid border-black p-1">
                    <EditableDataCell data={w.traditional} />
                  </td>
                  <td class="border border-solid border-black p-1">
                    <EditableDataCell data={w.pinyin} />
                  </td>
                  <td class="border border-solid border-black p-1">
                    <EditableDataCell data={w.english} />
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <WordForm
        onNewWord={(w: Word) => {
          const ws = [...words()];
          ws.push(w);
          setWords(ws);
        }}
      />
    </div>
  );
}
