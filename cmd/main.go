package main

import (
	"encoding/csv"
	"fmt"
	"html/template"
	"io"
	"os"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Template struct {
	tmpl *template.Template
}

func newTemplate() *Template {
	return &Template{
		tmpl: template.Must(template.ParseGlob("views/*.html")),
	}
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.tmpl.ExecuteTemplate(w, name, data)
}

type Data struct {
	Words []Word
	Flash string
}

func NewData(words []Word, flash string) *Data {
	return &Data{Words: words, Flash: flash}
}

type FormData struct {
	Errors map[string]string
	Values map[string]string
}

func NewFormData() FormData {
	return FormData{
		Errors: map[string]string{},
		Values: map[string]string{},
	}
}

type PageData struct {
	Data Data
	Form FormData
}

func NewPageData(data Data, form FormData) PageData {
	return PageData{
		Data: data,
		Form: form,
	}
}

type Word struct {
	Traditional string
	Pinyin      string
	English     string
}

type Quiz struct {
	Id int
	// TODO: migrate to enums
	From  []string
	To    []string
	Words []Word
}

var nextQuizId int = 0
var quizzes []Quiz

// TODO: session storage or real SQL persistence
// TODO: what if this runs out of memory or the id counter overflows???
// TODO: make thread safe
func NewQuiz(from []string, to []string, words []Word) *Quiz {
	nextQuizId += 1
	quiz := Quiz{
		Id:    (nextQuizId - 1),
		From:  from,
		To:    to,
		Words: words,
	}
	quizzes = append(quizzes, quiz)
	return &quiz
}

func readWords() ([]Word, error) {
	file, err := os.Open("words.csv")
	if err != nil {
		fmt.Println("readWords: Could not open words csv", err)
		return nil, err
	}
	defer file.Close()

	csvReader := csv.NewReader(file)
	csvReader.ReuseRecord = true

	words := []Word{}
	for {
		record, err := csvReader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			fmt.Println("Could not parse words csv: ", err)
			return nil, err
		}
		if len(record) != 3 {
			panic("CSV line with wrong number of columns, panicking...")
		}

		words = append(words, Word{record[0], record[1], record[2]})
	}

	return words, nil
}

func writeWords(words []Word) error {
	file, err := os.Create("words.csv")
	if err != nil {
		fmt.Println("writeWords: Could not open words csv", err)
		return err
	}
	defer file.Close()

	csvWriter := csv.NewWriter(file)

	row := []string{"", "", ""}
	for _, word := range words {
		row[0] = word.Traditional
		row[1] = word.Pinyin
		row[2] = word.English

		err := csvWriter.Write(row)
		if err != nil {
			fmt.Println("Could not write CSV", err)
			return err
		}
	}

	csvWriter.Flush()
	err = csvWriter.Error()
	if err != nil {
		fmt.Println("Could not flush CSV", err)
		return err
	}

	return nil
}

func main() {

	server := echo.New()

	server.Renderer = newTemplate()
	server.Use(middleware.Logger())
	server.Static("/images", "images")
	server.Static("/css", "css")

	server.GET("/", func(c echo.Context) error {
		words, err := readWords()
		if err != nil {
			words = []Word{}
		}

		data := NewData(words, "")

		return c.Render(200, "index.html", NewPageData(*data, NewFormData()))
	})

	server.POST("/delete", func(ctx echo.Context) error {
		englishName := ctx.FormValue("english")

		words, err := readWords()
		if err != nil {
			ctx.Logger().Error("POST /delete: could not read words", err)
			// TODO: figure out a proper error page / message
			return ctx.String(500, "Internal Server Error!")
		}

		deleted := false
		for i, word := range words {
			if word.English == englishName {
				// TODO: figure out why we need "..."
				words = append(words[0:i], words[i+1:]...)
				deleted = true
			}
		}

		if deleted {
			err = writeWords(words)
			if err != nil {
				ctx.Logger().Error("POST /delete: could not write words", err)
				// TODO: figure out a proper error page / message
				return ctx.String(500, "Internal Server Error!")
			}
		}

		return ctx.Redirect(302, "/")
	})

	server.POST("/edit", func(ctx echo.Context) error {
		englishName := ctx.FormValue("id")

		words, err := readWords()
		if err != nil {
			ctx.Logger().Error("POST /edit: could not read words", err)
			// TODO: figure out a proper error page / message
			return ctx.String(500, "Internal Server Error!")
		}

		updated := false
		for i, word := range words {
			if word.English == englishName {
				// need the index because word is a copy
				words[i].Traditional = ctx.FormValue("traditional")
				words[i].Pinyin = ctx.FormValue("pinyin")
				words[i].English = ctx.FormValue("english")
				updated = true
			}
		}

		if updated {
			err = writeWords(words)
			if err != nil {
				ctx.Logger().Error("POST /edit: could not write words", err)
				// TODO: figure out a proper error page / message
				return ctx.String(500, "Internal Server Error!")
			}
		} else {
			// TODO: maybe a flash message?
			return ctx.String(404, "Unknown word")
		}

		return ctx.Redirect(302, "/")
	})

	server.POST("/quiz/new", func(ctx echo.Context) error {
		err := ctx.Request().ParseForm()
		if err != nil {
			// TODO: maybe a flash message?
			return ctx.String(400, "bad request")
		}

		// TODO: validate all of these?
		from := ctx.Request().PostForm["from"]
		to := ctx.Request().PostForm["to"]
		wordKeys := ctx.Request().PostForm["words"]

		allWords, err := readWords()
		if err != nil {
			ctx.Logger().Error("POST /delete: could not read words", err)
			// TODO: figure out a proper error page / message
			return ctx.String(500, "Internal Server Error!")
		}

		words := []Word{}
		for _, key := range wordKeys {
			for _, word := range allWords {
				if key == word.English {
					words = append(words, word)
				}
			}
		}

		quiz := NewQuiz(from, to, words)

		return ctx.Redirect(302, fmt.Sprintf("/quiz/%d", quiz.Id))
	})

	server.GET("/quiz/:id", func(ctx echo.Context) error {
		id, err := strconv.Atoi(ctx.Param("id"))
		if err != nil {
			return ctx.String(400, "Bad id param")
		}

		var quiz *Quiz = nil
		for i := range quizzes {
			if id == quizzes[i].Id {
				quiz = &quizzes[i]
				break
			}
		}
		if quiz == nil {
			return ctx.String(400, fmt.Sprintf("Unknown quiz id: %d", id))
		}

		return ctx.Render(200, "quiz.html", quiz)
	})

	// server.POST("/contacts", func(c echo.Context) error {
	// 	name := c.FormValue("name")
	// 	email := c.FormValue("email")

	// 	if contactExists(data.Contacts, email) {
	// 		formData := FormData{
	// 			Errors: map[string]string{
	// 				"email": "Email already exists",
	// 			},
	// 			Values: map[string]string{
	// 				"name":  name,
	// 				"email": email,
	// 			},
	// 		}

	// 		return c.Render(422, "contact-form", formData)
	// 	}

	// 	contact := NewContact(id, name, email)
	// 	id++
	// 	data.Contacts = append(data.Contacts, contact)

	// 	formData := NewFormData()
	// 	err := c.Render(200, "contact-form", formData)

	// 	if err != nil {
	// 		return err
	// 	}

	// 	return c.Render(200, "oob-contact", contact)
	// })

	// server.DELETE("/contacts/:id", func(c echo.Context) error {
	// 	idStr := c.Param("id")
	// 	id, err := strconv.Atoi(idStr)

	// 	if err != nil {
	// 		return c.String(400, "Id must be an integer")
	// 	}

	// 	deleted := false
	// 	for i, contact := range data.Contacts {
	// 		if contact.Id == id {
	// 			data.Contacts = append(data.Contacts[:i], data.Contacts[i+1:]...)
	// 			deleted = true
	// 			break
	// 		}
	// 	}

	// 	if !deleted {
	// 		return c.String(400, "Contact not found")
	// 	}

	// 	time.Sleep(1 * time.Second)

	// 	return c.NoContent(200)
	// })

	server.Logger.Fatal(server.Start(":3000"))
}
