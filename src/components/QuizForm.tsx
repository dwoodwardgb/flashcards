export function QuizForm({}) {
  return (
    <form class="mt-3" action="/quiz">
      <div role="presentation" class="flex flex-row gap-8 w-full">
        <label>
          Shown fields
          <select
            name="shown"
            multiple
            class="block p-1 border-black border-solid border"
          >
            <option value="traditional">Traditional</option>
            <option value="pinyin">Pinyin</option>
            <option value="english">English</option>
          </select>
        </label>
        <label>
          Fields to guess
          <select
            name="guessed"
            multiple
            class="block p-1 border-black border-solid border"
          >
            <option value="traditional">Traditional</option>
            <option value="pinyin">Pinyin</option>
            <option value="english">English</option>
          </select>
        </label>
      </div>
      <button
        class="block p-1 border-black border-solid border mt-4"
        type="submit"
      >
        Start quiz
      </button>
    </form>
  );
}
