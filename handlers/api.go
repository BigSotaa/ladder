package handlers

import (
	_ "embed"
	"log"

	"github.com/gofiber/fiber/v2"
)

//nolint:all
//go:embed VERSION
var version string

// Api returns the requested URL in JSON format.
// It also returns the Ladder version and the headers of the request and response.
func Api(c *fiber.Ctx) error {
	// Get the url from the URL
	urlQuery := c.Params("*")

	queries := c.Queries()
	body, req, resp, err := fetchSite(urlQuery, queries)
	if err != nil {
		log.Println("ERROR:", err)
		c.SendStatus(500)
		return c.SendString(err.Error())
	}

	// Create a response object
	response := Response{
		Version: version,
		Body:    body,
	}

	// Add the request headers to the response
	response.Request.Headers = make([]any, 0, len(req.Header))
	for k, v := range req.Header {
		response.Request.Headers = append(response.Request.Headers, map[string]string{
			"key":   k,
			"value": v[0],
		})
	}

	// Add the response headers to the response
	response.Response.Headers = make([]any, 0, len(resp.Header))
	for k, v := range resp.Header {
		response.Response.Headers = append(response.Response.Headers, map[string]string{
			"key":   k,
			"value": v[0],
		})
	}

	// Return the response as JSON
	return c.JSON(response)
}

type Response struct {
	Version string `json:"version"`
	Body    string `json:"body"`
	Request struct {
		Headers []interface{} `json:"headers"`
	} `json:"request"`
	Response struct {
		Headers []interface{} `json:"headers"`
	} `json:"response"`
}
