package main

import (
	"flag"
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := flag.String("password", "", "plain text password to hash")
	cost := flag.Int("cost", bcrypt.DefaultCost, "bcrypt cost (10-14 typical)")
	flag.Parse()

	if *password == "" {
		fmt.Fprintln(os.Stderr, "password is required (use -password=...)")
		os.Exit(2)
	}

	if *cost < bcrypt.MinCost || *cost > bcrypt.MaxCost {
		fmt.Fprintf(os.Stderr, "cost must be between %d and %d\n", bcrypt.MinCost, bcrypt.MaxCost)
		os.Exit(2)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(*password), *cost)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	fmt.Println(string(hash))
}
