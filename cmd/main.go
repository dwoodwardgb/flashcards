package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"html/template"
	"io"
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
}

func NewData() *Data {
	return &Data{}
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

func main() {

	server := echo.New()

	data := NewData()

	server.Renderer = newTemplate()
	server.Use(middleware.Logger())
	server.Static("/images", "images")
	server.Static("/css", "css")

	server.GET("/", func(c echo.Context) error {
		return c.Render(200, "index.html.tmpl", NewPageData(*data, NewFormData()))
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
