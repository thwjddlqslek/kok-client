import { NaverMap } from "@repo/naver-map";
import { createPortal } from "react-dom";
import MapHeader from "@/components/midpoint-result/molecules/MapHeader";
import { AnimationBottomSheet, Text } from "@repo/ui/components";
import * as Style from "./StationMapExplorer.css";
import { useState, useEffect } from "react";
import {
  FILTER_OPTIONS,
  PlaceFilter,
  PlaceType,
} from "@/constants/filter-options";
import { useNaverMap, useMarker } from "@repo/naver-map";
import { useSearchPlacesByFilter } from "@/hooks/useSearchPlacesByFilter";
import { createPlaceMarkers } from "@/utils/createPlaceMarkers";

interface StationMapExplorerProps {
  setShowFullScreenMap: (value: boolean) => void;
  stationLocation: { latitude: number; longitude: number };
  stationName: string;
}

export const StationMapExplorer = ({
  setShowFullScreenMap,
  stationLocation,
  stationName,
}: StationMapExplorerProps) => {
  const handleMapClose = (e?: MouseEvent | TouchEvent) => {
    if (e) e.stopPropagation();
    setShowFullScreenMap(false);
  };

  const [selectedFilter, setSelectedFilter] = useState<PlaceType | null>(
    PlaceFilter.ACTIVITY
  );

  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const { map } = useNaverMap();
  const stationMarker = useMarker({ map: map! });
  const placesMarkers = useMarker({ map: map! });

  const { places, setPlaces, fetchPlaces } = useSearchPlacesByFilter({
    map,
    selectedFilter,
    stationLocation,
    onCleanUp: () => placesMarkers.cleanUp(),
  });

  useEffect(() => {
    if (map && selectedFilter) {
      fetchPlaces(selectedFilter);
    }
  }, [map]);

  useEffect(() => {
    if (!map || !window.naver) return;

    return () => {
      stationMarker.cleanUp();
    };
  }, [map, stationLocation, stationMarker]);

  useEffect(() => {
    if (places.length > 0 && selectedFilter && map) {
      createPlaceMarkers({
        map,
        places,
        placesMarkers,
        activeMarkerId,
        onMarkerClick: setActiveMarkerId,
      });
    }
  }, [places, selectedFilter, map, placesMarkers, activeMarkerId]);

  const handleFilterClick = (filterId: string) => {
    const newFilter = filterId as PlaceType;
    if (selectedFilter === newFilter) {
      return;
    }
    setActiveMarkerId(null);
    setSelectedFilter(newFilter);
    fetchPlaces(newFilter);
  };

  useEffect(() => {
    return () => {
      stationMarker.cleanUp();
      placesMarkers.cleanUp();
    };
  }, [stationMarker, placesMarkers]);

  return (
    <>
      {createPortal(
        <>
          <MapHeader
            title={`${stationName}역 둘러보기`}
            isLookAround={true}
            onClose={handleMapClose}
          />
          <div className={Style.fullScreenMapContainerStyle}>
            <NaverMap
              width="100%"
              height="100vh"
              zoom={13}
              center={{
                latitude: stationLocation.latitude,
                longitude: stationLocation.longitude,
              }}
            />
          </div>

          <AnimationBottomSheet>
            <div>
              <div className={Style.containerStyle}>
                {FILTER_OPTIONS.map((filter) => {
                  const IconComponent = filter.icon;
                  const isSelected = selectedFilter === filter.id;

                  return (
                    <div
                      key={filter.id}
                      className={Style.FilterStyle}
                      onClick={() => handleFilterClick(filter.id)}
                    >
                      <div className={Style.iconContainerStyle}>
                        <IconComponent />
                      </div>
                      <Text
                        variant="title4"
                        className={`${Style.filterTextStyle}
                          ${isSelected && Style.selectedFilterTextStyle}`}
                      >
                        {filter.name}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
          </AnimationBottomSheet>
        </>,
        document.body
      )}
    </>
  );
};
