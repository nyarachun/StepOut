import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EventCard, type EventCardData } from '../EventCard/EventCard';
import { filterEvents, type EventFilters } from './eventFilters';
import './EventCarousel.scss';

type EventCarouselProps = {
    title?: string;
    cityName?: string;
    events: EventCardData[];
    filters?: EventFilters;
};

export const EventCarousel = ({
    title,
    cityName,
    events,
    filters,
}: EventCarouselProps) => {
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const filteredEvents = useMemo(
        () => filterEvents(events, filters),
        [events, filters],
    );

    const hasEvents = filteredEvents.length > 0;

    useEffect(() => {
        const carousel = carouselRef.current;

        if (!carousel) {
            return;
        }

        const updateScrollButtons = () => {
            const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
            setCanScrollLeft(carousel.scrollLeft > 1);
            setCanScrollRight(carousel.scrollLeft < maxScrollLeft - 1);
        };

        let ticking = false;

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateScrollButtons();
                    ticking = false;
                });
                ticking = true;
            }
        };

        const resizeObserver = new ResizeObserver(updateScrollButtons);

        carousel.addEventListener('scroll', onScroll, { passive: true });
        resizeObserver.observe(carousel);

        requestAnimationFrame(updateScrollButtons);

        return () => {
            carousel.removeEventListener('scroll', onScroll);
            resizeObserver.disconnect();
        };
    }, [filteredEvents.length]);

    const scrollCarousel = (direction: number) => {
        if (!carouselRef.current) {
            return;
        }

        carouselRef.current.scrollBy({
            left: direction * 320,
            behavior: 'smooth',
        });
    };

    return (
        <section className="event-carousel">
            <div className="event-carousel__container">
                <div className="event-carousel__top">
                    <div className="event-carousel__info">
                        {title && (
                            <h2 className="event-carousel__title">
                                {title}
                            </h2>
                        )}

                        <div className="event-carousel__meta">
                            {cityName && (
                                <span className="event-carousel__city">
                                    <MapPin size={14} />
                                    <span>{cityName}</span>
                                </span>
                            )}

                            <span className="event-carousel__count">
                                {filteredEvents.length}{' '}
                                {filteredEvents.length === 1 ? 'event' : 'events'}
                            </span>
                        </div>
                    </div>

                    <div className="event-carousel__buttons">
                        <button
                            className="event-carousel__arrow"
                            type="button"
                            disabled={!hasEvents || !canScrollLeft}
                            onClick={() => scrollCarousel(-1)}
                            aria-label="Previous events"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            className="event-carousel__arrow"
                            type="button"
                            disabled={!hasEvents || !canScrollRight}
                            onClick={() => scrollCarousel(1)}
                            aria-label="Next events"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {hasEvents ? (
                    <div className="event-carousel__list" ref={carouselRef}>
                        {filteredEvents.map((event) => (
                            <div className="event-carousel__item" key={event.id}>
                                <EventCard event={event} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="event-carousel__empty">
                        No events found.
                    </div>
                )}
            </div>
        </section>
    );
};