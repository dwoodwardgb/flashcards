import { createSignal, For, createEffect, onMount } from "solid-js";
import { Word, WordForm } from "./WordForm";
import { EditableDataCell } from "./DataTableCell";

export const Words = Object.freeze({
  toString(words: Word[]): string {
    let result = "";
    for (const word of words) {
      result += `${word.traditional},${word.pinyin},${word.english}\n`;
    }
    return result;
  },
  fromString(s: string): Word[] | undefined {
    return s
      .trim()
      .split("\n")
      .map((line) => {
        const [a, b, c] = line.split(",");
        return {
          traditional: a,
          pinyin: b,
          english: c,
        };
      });
  },
});

export function DataTable() {
  const [words, setWords] = createSignal<Word[]>([]);

  onMount(() => {
    setWords(JSON.parse(window?.localStorage.getItem("words")) || []);
  });

  createEffect(() => {
    if (window && words()) {
      window?.localStorage.setItem("words", JSON.stringify(words()));
    }
  });

  return (
    <div role="presentation">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data: { text?: string | undefined } = {};
          const elements = event.target["elements"];
          for (let i = 0; i < elements.length; i += 1) {
            const field = elements[i];
            if (field.name) {
              data[field.name] = field.value;
              field.value = "";
            }
          }
          try {
            const text = data.text;
            const newWords = Words.fromString(text);
            if (window.confirm(`Found ${newWords.length} words, proceed?`)) {
              setWords(newWords);
            }
          } catch (e) {
            console.error(e);
            window.alert(`Error ${e?.getMessage?.()}`);
          }
        }}
      >
        <label>
          Words dump
          <textarea
            name="text"
            class="block p-1 border-black border-solid border mt-4"
          ></textarea>
        </label>
        <button
          type="submit"
          class="block p-1 border-black border-solid border mt-4"
        >
          Import words
        </button>
      </form>

      <button
        type="button"
        class="block p-1 border-black border-solid border mt-4"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(Words.toString(words()));
            window.alert(
              `All ${
                words().length
              } word(s) copied to your clipboard, store them somewhere safe!`
            );
          } catch (e) {
            console.error(e);
            window.alert(`Error ${e?.getMessage?.()}`);
          }
        }}
      >
        Copy to clipboard
      </button>

      <div class="mr-16" role="presentation">
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
                    <EditableDataCell
                      data={w.traditional}
                      setData={(data) => {
                        const ws = [...words()];
                        const i = ws.indexOf(w);
                        if (i < 0) {
                          return;
                        }
                        const newWord = { ...w };

                        newWord.traditional = data;

                        ws[i] = newWord;
                        setWords(ws);
                      }}
                    />
                  </td>
                  <td class="border border-solid border-black p-1">
                    <EditableDataCell
                      data={w.pinyin}
                      setData={(data) => {
                        const ws = [...words()];
                        const i = ws.indexOf(w);
                        if (i < 0) {
                          return;
                        }
                        const newWord = { ...w };

                        newWord.pinyin = data;

                        ws[i] = newWord;
                        setWords(ws);
                      }}
                    />
                  </td>
                  <td class="border border-solid border-black p-1">
                    <EditableDataCell
                      data={w.english}
                      setData={(data) => {
                        const ws = [...words()];
                        const i = ws.indexOf(w);
                        if (i < 0) {
                          return;
                        }
                        const newWord = { ...w };

                        newWord.english = data;

                        ws[i] = newWord;
                        setWords(ws);
                      }}
                    />
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
