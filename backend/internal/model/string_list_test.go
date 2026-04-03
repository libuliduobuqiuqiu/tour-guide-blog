package model

import "testing"

func TestStringListValue(t *testing.T) {
	value, err := StringList{"a", "b"}.Value()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if value != "[\"a\",\"b\"]" {
		t.Fatalf("unexpected value: %v", value)
	}
}

func TestStringListScan(t *testing.T) {
	var list StringList
	if err := list.Scan("[\"x\",\"y\"]"); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(list) != 2 || list[0] != "x" || list[1] != "y" {
		t.Fatalf("unexpected scan result: %#v", list)
	}
}

func TestStringListScanInvalidType(t *testing.T) {
	var list StringList
	if err := list.Scan(123); err == nil {
		t.Fatal("expected error for unsupported scan type")
	}
}
