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

func TestTourAvailabilityValue(t *testing.T) {
	value, err := TourAvailability{
		{Date: "2026-04-20", BookedCount: 3, IsOpen: true},
	}.Value()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if value != "[{\"date\":\"2026-04-20\",\"booked_count\":3,\"is_open\":true}]" {
		t.Fatalf("unexpected value: %v", value)
	}
}

func TestTourAvailabilityScan(t *testing.T) {
	var availability TourAvailability
	if err := availability.Scan("[{\"date\":\"2026-04-20\",\"booked_count\":2,\"is_open\":true}]"); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(availability) != 1 || availability[0].Date != "2026-04-20" || availability[0].BookedCount != 2 || !availability[0].IsOpen {
		t.Fatalf("unexpected scan result: %#v", availability)
	}
}

func TestTourAvailabilityScanInvalidType(t *testing.T) {
	var availability TourAvailability
	if err := availability.Scan(123); err == nil {
		t.Fatal("expected error for unsupported scan type")
	}
}
