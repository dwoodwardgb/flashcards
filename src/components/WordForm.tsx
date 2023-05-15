export type Word = {
  traditional: string;
  pinyin: string;
  english: string;
};

export function WordForm({ onNewWord }: { onNewWord: (w: Word) => void }) {
  return (
    <form
      class="flex excel-like-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = {};
        const elements = event.target["elements"];
        for (let i = 0; i < elements.length; i += 1) {
          const field = elements[i];
          data[field.name] = field.value;
          field.value = "";
        }
        onNewWord(data as Word);
      }}
    >
      <label class="flex-grow p-1">
        <span class="sr-only">Traditional</span>
        <input type="text" class="w-full p-1" name="traditional" />
      </label>
      <label class="flex-grow p-1">
        <span class="sr-only">Pinyin</span>
        <input type="text" class="w-full p-1" name="pinyin" />
      </label>
      <label class="flex-grow p-1">
        <span class="sr-only">English</span>
        <input type="text" class="w-full p-1" name="english" />
      </label>
      <button class="w-16" type="submit">
        Add
      </button>
    </form>
  );
}
