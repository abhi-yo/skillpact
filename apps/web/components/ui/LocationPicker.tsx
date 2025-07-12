'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from './input';
import { Skeleton } from './skeleton';
import { Button } from './button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, MapPin, CheckCircle, Navigation } from 'lucide-react';

interface LocationPickerProps {
  form?: UseFormReturn<any>;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  onLocationSaved?: (data: { latitude: number; longitude: number; address: string }) => void;
  standalone?: boolean; 
}

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

async function reverseGeocode(lat: number, lon: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error('Failed to fetch address');
    const data = await res.json();
    return data.display_name || 'Address not found';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Could not retrieve address';
  }
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
  form, 
  initialAddress = '', 
  initialLat = 0, 
  initialLng = 0, 
  onLocationSaved,
  standalone = false 
}) => {
  const [locationQuery, setLocationQuery] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const setLocationMutation = trpc.location.setLocation.useMutation({
    onSuccess: (data) => {
      toast.success('Location saved successfully!');
      setHasUnsavedChanges(false);
      if (onLocationSaved) {
        onLocationSaved({ latitude: currentLat, longitude: currentLng, address: locationQuery });
      }
    },
    onError: (error) => {
      toast.error(`Failed to save location: ${error.message}`);
    },
  });

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLocationLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch(locationQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [locationQuery, handleSearch]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    setLocationQuery(suggestion.display_name);
    setCurrentLat(lat);
    setCurrentLng(lon);
    setHasUnsavedChanges(true);
    
    if (form) {
      form.setValue('locationAddress', suggestion.display_name, { shouldValidate: true });
      form.setValue('locationCoords', { lat, lon }, { shouldValidate: true });
    }
    
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        setHasUnsavedChanges(true);
        
        try {
          const address = await reverseGeocode(latitude, longitude);
          setLocationQuery(address);
          
          if (form) {
            form.setValue('locationAddress', address, { shouldValidate: true });
            form.setValue('locationCoords', { lat: latitude, lon: longitude }, { shouldValidate: true });
          }
          
          toast.success('Current location detected!');
        } catch (error) {
          toast.error('Could not get address for current location');
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Could not get your current location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location permissions and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Could not get your current location. Please try typing an address instead.';
        }
        
        toast.error(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleSaveLocation = async () => {
    if (!currentLat || !currentLng) {
      toast.error('Please select a location first');
      return;
    }

    try {
      const addressParts = locationQuery.split(',').map(part => part.trim());
      
      setLocationMutation.mutate({
        latitude: currentLat,
        longitude: currentLng,
        address: locationQuery,
        city: addressParts.length > 1 ? addressParts[addressParts.length - 2] : undefined,
        country: addressParts.length > 0 ? addressParts[addressParts.length - 1] : undefined,
        radius: 10
      });
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    }
  };

  return (
    <div className="space-y-4 relative" ref={containerRef}>
      <div className="relative">
        <Input
          type="text"
          value={locationQuery}
          onChange={(e) => {
            setLocationQuery(e.target.value);
            setShowSuggestions(true);
            if (e.target.value !== initialAddress) {
              setHasUnsavedChanges(true);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type an address or use current location..."
          autoComplete="off"
          className="pr-10"
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={gettingLocation}
          size="sm"
          className="flex-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
        >
          {gettingLocation ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              Use Current Location
            </>
          )}
        </Button>
      </div>

      {showSuggestions && (
        <div className="absolute z-10 w-full bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_#000] mt-1">
          {locationLoading ? (
            <div className="p-2">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            suggestions.length > 0 && (
              <ul className="max-h-60 overflow-y-auto">
                {suggestions.map((s) => (
                  <li
                    key={s.place_id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => handleSelectSuggestion(s)}
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      )}

      {currentLat !== 0 && currentLng !== 0 && (
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 border-2 border-black rounded-md">
            <div className="text-sm font-medium text-gray-700 mb-2">Selected Location:</div>
            <div className="text-sm text-gray-600 mb-2">{locationQuery}</div>
            <div className="text-xs text-gray-500">
              Coordinates: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
            </div>
          </div>

          {standalone && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border-2 border-black rounded-md">
              <div className="flex items-center space-x-2">
                {hasUnsavedChanges ? (
                  <>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700">Location changed - click save to update</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Location saved</span>
                  </>
                )}
              </div>
              
              <Button
                onClick={handleSaveLocation}
                disabled={!hasUnsavedChanges || setLocationMutation.isPending}
                size="sm"
                className="px-4 py-1 bg-blue-500 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[2px_2px_0px_#000] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {setLocationMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Location'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 