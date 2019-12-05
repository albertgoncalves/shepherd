package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
)

func main() {
    host := os.Getenv("HOST")
    port := os.Getenv("PORT")
    http.Handle("/", http.FileServer(http.Dir("../client/src")))
    log.Printf("listening on http://%s:%s/\n", host, port)
    if err := http.ListenAndServe(fmt.Sprintf(":%s", port), nil); err != nil {
        log.Fatal(err)
    }
}
