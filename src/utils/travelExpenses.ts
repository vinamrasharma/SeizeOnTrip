export interface TravelExpenseOption {
  id: string;
  mode: 'walk' | 'shared_auto' | 'auto' | 'cab' | 'boat' | 'bus' | 'train' | 'flight';
  modeLabel: string;
  category: 'Free' | 'Budget' | 'Standard' | 'Premium';
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  timeEstimate: string;
  description: string;
  tag?: string;
  tagColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'gray';
  isRecommended?: boolean;
}

/**
 * Calculates travel expenses and estimates based on distance in kilometers,
 * place context (such as river ghats), and standard transit tariffs.
 */
export function calculateTravelExpenses(
  distanceKm: number,
  placeInfo?: { name?: string; location?: string; tags?: string[] }
): TravelExpenseOption[] {
  const km = Math.max(0.1, typeof distanceKm === 'number' && !isNaN(distanceKm) ? distanceKm : 1.5);
  const options: TravelExpenseOption[] = [];

  const nameLower = (placeInfo?.name || '').toLowerCase();
  const locLower = (placeInfo?.location || '').toLowerCase();
  const isGhatOrRiver =
    nameLower.includes('ghat') ||
    locLower.includes('ghat') ||
    nameLower.includes('ganga') ||
    nameLower.includes('river');

  const isInternational =
    locLower.includes('japan') ||
    locLower.includes('france') ||
    locLower.includes('indonesia') ||
    locLower.includes('italy') ||
    locLower.includes('uae') ||
    locLower.includes('dubai') ||
    locLower.includes('thailand') ||
    locLower.includes('paris') ||
    locLower.includes('tokyo') ||
    locLower.includes('rome') ||
    locLower.includes('bali') ||
    locLower.includes('singapore') ||
    km > 2500;

  // 1. Walking (only practical for <= 3.5 km)
  if (km <= 3.5) {
    const walkMins = Math.max(2, Math.round(km * 12));
    options.push({
      id: 'walk',
      mode: 'walk',
      modeLabel: 'Walking on Foot',
      category: 'Free',
      priceRange: '₹0 (Free)',
      minPrice: 0,
      maxPrice: 0,
      currency: 'INR',
      timeEstimate: `~${walkMins} min`,
      description: 'Zero expense. Best for navigating historic narrow lanes, bazaars, and pedestrian ghats.',
      tag: 'Zero Cost',
      tagColor: 'emerald',
      isRecommended: km <= 1.2,
    });
  }

  // 2. River Boat / Water Taxi (Varanasi Ghats & riverbanks)
  if (isGhatOrRiver && km <= 15) {
    options.push({
      id: 'boat',
      mode: 'boat',
      modeLabel: 'Ganga Wooden Boat / Water Taxi',
      category: 'Budget',
      priceRange: '₹60 – ₹150',
      minPrice: 60,
      maxPrice: 150,
      currency: 'INR',
      timeEstimate: `~${Math.round(km * 6 + 10)} min cruise`,
      description: 'Scenic river route bypassing road congestion between Dashashwamedh, Assi & Manikarnika.',
      tag: 'Scenic Route',
      tagColor: 'blue',
      isRecommended: isGhatOrRiver && km <= 4,
    });
  }

  // 3. Shared E-Rickshaw / Shared Auto (Local city travel up to 25 km)
  if (km <= 25 && !isInternational) {
    const minCost = km <= 3 ? 15 : km <= 7 ? 20 : km <= 15 ? 30 : 40;
    const maxCost = minCost + 10;
    const timeMins = Math.max(5, Math.round(km * 3.5 + 4));

    options.push({
      id: 'shared_auto',
      mode: 'shared_auto',
      modeLabel: 'Shared E-Rickshaw / Auto',
      category: 'Budget',
      priceRange: `₹${minCost} – ₹${maxCost}`,
      minPrice: minCost,
      maxPrice: maxCost,
      currency: 'INR',
      timeEstimate: `~${timeMins} min`,
      description: 'Ultra-economical public electric rickshaw. Fixed per-head rates along major transit arteries.',
      tag: 'Budget Favorite',
      tagColor: 'emerald',
      isRecommended: km > 1.2 && km <= 6,
    });
  }

  // 4. Private Auto-Rickshaw / Tuk-Tuk (up to 45 km)
  if (km <= 45 && !isInternational) {
    const minCost = Math.round(40 + km * 11);
    const maxCost = Math.round(55 + km * 14);
    const timeMins = Math.max(4, Math.round(km * 2.8 + 3));

    options.push({
      id: 'auto',
      mode: 'auto',
      modeLabel: 'Private Auto-Rickshaw',
      category: 'Standard',
      priceRange: `₹${minCost} – ₹${maxCost}`,
      minPrice: minCost,
      maxPrice: maxCost,
      currency: 'INR',
      timeEstimate: `~${timeMins} min`,
      description: 'Direct door-to-door point drop without waiting for other passengers. Metered or negotiable.',
      tag: 'Direct Drop',
      tagColor: 'amber',
      isRecommended: km > 3 && km <= 12,
    });
  }

  // 5. Private Cab / AC Taxi (Uber, Ola, or local taxi)
  if (km <= 160 && !isInternational) {
    const minCost = Math.round(80 + km * 14);
    const maxCost = Math.round(120 + km * 18);
    const timeMins = Math.max(6, Math.round(km * 2.2 + 2));

    options.push({
      id: 'cab',
      mode: 'cab',
      modeLabel: 'AC Cab / Ride-Share (Uber / Ola)',
      category: 'Premium',
      priceRange: `₹${minCost} – ₹${maxCost}`,
      minPrice: minCost,
      maxPrice: maxCost,
      currency: 'INR',
      timeEstimate: `~${timeMins} min`,
      description: 'Comfortable air-conditioned hatchback or sedan. Recommended for luggage, families, or midday heat.',
      tag: 'Most Comfortable',
      tagColor: 'purple',
      isRecommended: km > 12 && km <= 60,
    });
  }

  // 6. Intercity Express / AC Bus (for 30 km to 450 km)
  if (km > 30 && km <= 450 && !isInternational) {
    const minCost = Math.round(km * 1.5);
    const maxCost = Math.round(km * 2.5);
    const hours = (km / 45).toFixed(1);

    options.push({
      id: 'bus',
      mode: 'bus',
      modeLabel: 'Intercity Bus (AC / Express)',
      category: 'Budget',
      priceRange: `₹${minCost} – ₹${maxCost}`,
      minPrice: minCost,
      maxPrice: maxCost,
      currency: 'INR',
      timeEstimate: `~${hours} hrs`,
      description: 'Regular government state transport & private AC sleeper buses with frequent departures.',
      tag: 'Intercity Bus',
      tagColor: 'blue',
      isRecommended: km > 45 && km <= 120,
    });
  }

  // 7. Express Train / Superfast / Vande Bharat (for 45 km to 2500 km)
  if (km > 45 && !isInternational) {
    const minCost = Math.max(80, Math.round(km * 0.55)); // 2S/Sleeper
    const maxCost = Math.max(250, Math.round(km * 1.35)); // 3AC / Chair Car
    const hours = (km / 75).toFixed(1);

    options.push({
      id: 'train',
      mode: 'train',
      modeLabel: 'Superfast / Vande Bharat Train',
      category: 'Standard',
      priceRange: `₹${minCost} – ₹${maxCost}`,
      minPrice: minCost,
      maxPrice: maxCost,
      currency: 'INR',
      timeEstimate: `~${hours} hrs`,
      description: 'Fast, smooth and scenic rail transit connecting major junctions and heritage cities.',
      tag: 'Best Intercity Value',
      tagColor: 'emerald',
      isRecommended: km > 80 && km <= 800,
    });
  }

  // 8. Flight / Domestic Air (for > 250 km in India)
  if (km > 250 && !isInternational) {
    const minCost = Math.max(2900, Math.min(7500, Math.round(2500 + km * 2.2)));
    const maxCost = Math.max(4500, Math.min(12500, Math.round(3800 + km * 3.4)));
    const duration = km > 1200 ? '2h 15m flight' : '1h 20m flight';

    options.push({
      id: 'flight',
      mode: 'flight',
      modeLabel: 'Domestic Direct Flight',
      category: 'Premium',
      priceRange: `₹${minCost.toLocaleString()} – ₹${maxCost.toLocaleString()}`,
      minPrice: minCost,
      maxPrice: maxCost,
      currency: 'INR',
      timeEstimate: `~${duration}`,
      description: 'Fastest transit between regional airports with online check-in.',
      tag: 'Fastest',
      tagColor: 'purple',
      isRecommended: km > 650,
    });
  }

  // 9. International Flight & Transit (for overseas locations)
  if (isInternational) {
    options.push(
      {
        id: 'flight_intl',
        mode: 'flight',
        modeLabel: 'International Commercial Flight',
        category: 'Premium',
        priceRange: '₹18,500 – ₹42,000',
        minPrice: 18500,
        maxPrice: 42000,
        currency: 'INR',
        timeEstimate: '5h – 9h flight',
        description: 'Economy return/one-way airfare from major Indian metropolitan hubs (DEL/BOM/CCU).',
        tag: 'International',
        tagColor: 'purple',
        isRecommended: true,
      },
      {
        id: 'dest_transit',
        mode: 'bus',
        modeLabel: 'Destination City Transit (Metro/Tram Pass)',
        category: 'Standard',
        priceRange: '₹450 – ₹1,200 / day',
        minPrice: 450,
        maxPrice: 1200,
        currency: 'INR',
        timeEstimate: 'Unlimited 24h Day Pass',
        description: 'High-speed local metro, rail, or tram pass at the international destination.',
        tag: 'Local City Pass',
        tagColor: 'blue',
      }
    );
  }

  return options;
}

export interface PlaceExpenseSummary {
  visit: {
    amount: number;
    formatted: string;
    isFree: boolean;
    label: string;
    entryFeeText: string;
    activitiesEstimateText: string;
    items: { label: string; cost: string; note?: string }[];
  };
  travel: {
    recommendedMode: TravelExpenseOption;
    minCost: number;
    maxCost: number;
    formattedRange: string;
    modeLabel: string;
    options: TravelExpenseOption[];
    distanceKm: number;
  };
  whole: {
    minTotal: number;
    maxTotal: number;
    formatted: string;
    isCompletelyFree: boolean;
    quickBreakdown: string; // e.g. "Visit: ₹0 + Travel: ₹20"
  };
}

/**
 * Calculates both Visit Expense (entry, activities, offerings) and
 * Travel Expense (transit tariffs from user coordinates), plus the
 * combined Whole Expense.
 */
export function calculateWholePlaceExpenses(
  place: {
    name: string;
    location?: string;
    priceLevel?: string;
    priceNumeric?: number;
    approxCostPerPerson?: number;
    tags?: string[];
    generalDetails?: { entryFee?: string };
  },
  distanceKm: number = 1.5
): PlaceExpenseSummary {
  const km = Math.max(0.1, typeof distanceKm === 'number' && !isNaN(distanceKm) ? distanceKm : 1.5);
  const options = calculateTravelExpenses(km, {
    name: place.name,
    location: place.location,
    tags: place.tags,
  });

  // 1. Visit Expense Calculation
  const isFreeLevel =
    place.priceLevel === 'Free' ||
    (place.priceNumeric === 0 && !place.approxCostPerPerson);
  const entryFeeStr = place.generalDetails?.entryFee || (isFreeLevel ? 'Free Public Entry' : '₹50 – ₹100');

  let entryCost = 0;
  if (!isFreeLevel) {
    if (place.priceNumeric && place.priceNumeric > 0) {
      entryCost = place.priceNumeric;
    } else if (place.approxCostPerPerson && place.approxCostPerPerson > 0) {
      entryCost = place.approxCostPerPerson;
    } else if (place.priceLevel === '₹₹₹' || place.priceLevel === '₹₹₹₹') {
      entryCost = 800;
    } else if (place.priceLevel === '₹₹') {
      entryCost = 350;
    } else {
      entryCost = 150;
    }
  }

  const visitItems: { label: string; cost: string; note?: string }[] = [];

  if (entryCost === 0) {
    visitItems.push({
      label: 'Admission / Entry Ticket',
      cost: '₹0 (Free)',
      note: 'Open public heritage access',
    });
    // Optional typical on-site offering or refreshments
    visitItems.push({
      label: 'Optional Offerings / Refreshments',
      cost: '₹20 – ₹50',
      note: 'Flowers, prasad, or local kulhad chai',
    });
  } else {
    visitItems.push({
      label: 'Admission / Ticket Fee',
      cost: `₹${Math.round(entryCost * 0.4 || 50)}`,
      note: 'Standard entrance ticket',
    });
    visitItems.push({
      label: 'Activities, Audio Guide or Workshop',
      cost: `₹${Math.round(entryCost * 0.6 || 100)}`,
      note: 'Tasting, artisan demo, or guided tour',
    });
  }

  const visitFormatted = entryCost === 0 ? 'Free Entry' : `₹${entryCost.toLocaleString()}`;

  // 2. Travel Expense Calculation
  // Pick recommended mode, or the most practical motorized/walking mode
  const recommended = options.find((o) => o.isRecommended) || options[0];
  const travelMin = recommended ? recommended.minPrice : 20;
  const travelMax = recommended ? recommended.maxPrice : 40;
  const travelRange =
    recommended?.minPrice === 0 && recommended?.maxPrice === 0
      ? '₹0 (Walk)'
      : recommended?.minPrice === recommended?.maxPrice
      ? `₹${recommended?.minPrice}`
      : `₹${recommended?.minPrice} – ₹${recommended?.maxPrice}`;

  // 3. Whole Trip Expense (Combined Visit + Travel)
  const totalMin = entryCost + travelMin;
  const totalMax = entryCost + travelMax;
  const isCompletelyFree = totalMin === 0 && totalMax === 0;

  let formattedWhole = '';
  if (isCompletelyFree) {
    formattedWhole = '₹0 (Completely Free)';
  } else if (totalMin === totalMax) {
    formattedWhole = `Est. ₹${totalMin.toLocaleString()}`;
  } else {
    formattedWhole = `Est. ₹${totalMin.toLocaleString()} – ₹${totalMax.toLocaleString()}`;
  }

  const quickBreakdown =
    entryCost === 0
      ? `Visit: Free + Travel: ${travelRange}`
      : `Visit: ₹${entryCost} + Travel: ${travelRange}`;

  return {
    visit: {
      amount: entryCost,
      formatted: visitFormatted,
      isFree: entryCost === 0,
      label: entryCost === 0 ? 'Free Admission' : 'Visit & Admission',
      entryFeeText: entryFeeStr,
      activitiesEstimateText: entryCost === 0 ? 'Nominal ₹20-50 for refreshments' : `Approx. ₹${entryCost} per person`,
      items: visitItems,
    },
    travel: {
      recommendedMode: recommended,
      minCost: travelMin,
      maxCost: travelMax,
      formattedRange: travelRange,
      modeLabel: recommended?.modeLabel || 'Local Transit',
      options,
      distanceKm: km,
    },
    whole: {
      minTotal: totalMin,
      maxTotal: totalMax,
      formatted: formattedWhole,
      isCompletelyFree,
      quickBreakdown,
    },
  };
}
