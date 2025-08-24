// Power calculation utilities

import { PowerIndicators } from '@/types'
import { POWER_INDEX_WEIGHTS } from './constants'

export interface PowerIndexComponents {
  military: number
  economic: number
  demographic: number
  energy: number
  allianceCentrality: number
  conflictStability: number
  total: number
}

/**
 * Calculate comprehensive power index for a country
 */
export function calculatePowerIndex(
  indicators: PowerIndicators,
  allianceCentrality: number = 0,
  conflictIntensity: number = 0
): PowerIndexComponents {
  // Normalize military indicators (0-100 scale)
  const militaryExpenditure = Math.min(100, (indicators.military.expenditure / 50000) * 100)
  const militaryGDPRatio = Math.min(100, (indicators.military.expenditurePerGDP / 5) * 100)
  const armsTradeBalance = Math.min(100, 
    ((indicators.military.armsExports - indicators.military.armsImports + 1000) / 2000) * 100
  )
  const militaryPersonnel = Math.min(100, (indicators.military.personnel / 1000000) * 100)
  
  const military = (militaryExpenditure * 0.4 + militaryGDPRatio * 0.3 + 
                   armsTradeBalance * 0.2 + militaryPersonnel * 0.1)

  // Normalize economic indicators (0-100 scale)
  const gdpSize = Math.min(100, (indicators.economic.gdp / 2000000) * 100)
  const gdpPerCapita = Math.min(100, (indicators.economic.gdpPerCapita / 50000) * 100)
  const gdpGrowth = Math.min(100, Math.max(0, (indicators.economic.gdpGrowth + 5) / 10 * 100))
  const inflationStability = Math.min(100, Math.max(0, (20 - indicators.economic.inflation) / 20 * 100))
  const tradeBalance = Math.min(100, 
    Math.max(0, (indicators.economic.tradeBalance + 100000) / 200000 * 100)
  )

  const economic = (gdpSize * 0.3 + gdpPerCapita * 0.25 + gdpGrowth * 0.2 + 
                   inflationStability * 0.15 + tradeBalance * 0.1)

  // Normalize demographic indicators (0-100 scale)
  const populationSize = Math.min(100, (indicators.demographic.population / 200000000) * 100)
  const populationGrowth = Math.min(100, Math.max(0, (indicators.demographic.populationGrowth + 2) / 4 * 100))
  const urbanization = Math.min(100, indicators.demographic.urbanization)
  const ageStructure = Math.min(100, Math.max(0, (50 - indicators.demographic.medianAge) / 20 * 100))
  const literacy = Math.min(100, indicators.demographic.literacyRate)

  const demographic = (populationSize * 0.3 + populationGrowth * 0.2 + urbanization * 0.2 + 
                      ageStructure * 0.15 + literacy * 0.15)

  // Normalize energy indicators (0-100 scale)
  const oilProduction = Math.min(100, (indicators.energy.oilProduction / 10000000) * 100)
  const oilReserves = Math.min(100, (indicators.energy.oilReserves / 300) * 100)
  const gasProduction = Math.min(100, (indicators.energy.gasProduction / 500000000000) * 100)
  const gasReserves = Math.min(100, (indicators.energy.gasReserves / 50000000000000) * 100)
  const renewableCapacity = Math.min(100, (indicators.energy.renewableCapacity / 200000) * 100)
  const energyConsumption = Math.min(100, (indicators.energy.energyConsumption / 1000) * 100)

  const energy = (oilProduction * 0.25 + oilReserves * 0.2 + gasProduction * 0.2 + 
                 gasReserves * 0.15 + renewableCapacity * 0.1 + energyConsumption * 0.1)

  // Alliance centrality (0-100 scale, provided externally)
  const allianceScore = Math.min(100, Math.max(0, allianceCentrality))

  // Conflict stability (negative impact, 0-100 scale where higher conflict = lower stability)
  const conflictStability = Math.min(100, Math.max(0, 100 - conflictIntensity))

  // Calculate weighted total
  const total = Math.min(100, Math.max(0,
    military * POWER_INDEX_WEIGHTS.MILITARY +
    economic * POWER_INDEX_WEIGHTS.ECONOMIC +
    demographic * POWER_INDEX_WEIGHTS.DEMOGRAPHIC +
    energy * POWER_INDEX_WEIGHTS.ENERGY +
    allianceScore * POWER_INDEX_WEIGHTS.ALLIANCE_CENTRALITY +
    conflictStability * POWER_INDEX_WEIGHTS.CONFLICT_STABILITY
  ))

  return {
    military: Math.round(military * 10) / 10,
    economic: Math.round(economic * 10) / 10,
    demographic: Math.round(demographic * 10) / 10,
    energy: Math.round(energy * 10) / 10,
    allianceCentrality: Math.round(allianceScore * 10) / 10,
    conflictStability: Math.round(conflictStability * 10) / 10,
    total: Math.round(total * 10) / 10
  }
}

/**
 * Calculate military power sub-index
 */
export function calculateMilitaryPower(indicators: PowerIndicators): number {
  const expenditure = Math.min(100, (indicators.military.expenditure / 50000) * 100)
  const gdpRatio = Math.min(100, (indicators.military.expenditurePerGDP / 5) * 100)
  const armsBalance = Math.min(100, 
    ((indicators.military.armsExports - indicators.military.armsImports + 1000) / 2000) * 100
  )
  const personnel = Math.min(100, (indicators.military.personnel / 1000000) * 100)
  
  return Math.round((expenditure * 0.4 + gdpRatio * 0.3 + armsBalance * 0.2 + personnel * 0.1) * 10) / 10
}

/**
 * Calculate economic power sub-index
 */
export function calculateEconomicPower(indicators: PowerIndicators): number {
  const gdp = Math.min(100, (indicators.economic.gdp / 2000000) * 100)
  const gdpPerCapita = Math.min(100, (indicators.economic.gdpPerCapita / 50000) * 100)
  const growth = Math.min(100, Math.max(0, (indicators.economic.gdpGrowth + 5) / 10 * 100))
  const inflation = Math.min(100, Math.max(0, (20 - indicators.economic.inflation) / 20 * 100))
  const trade = Math.min(100, Math.max(0, (indicators.economic.tradeBalance + 100000) / 200000 * 100))

  return Math.round((gdp * 0.3 + gdpPerCapita * 0.25 + growth * 0.2 + inflation * 0.15 + trade * 0.1) * 10) / 10
}

/**
 * Calculate demographic power sub-index
 */
export function calculateDemographicPower(indicators: PowerIndicators): number {
  const population = Math.min(100, (indicators.demographic.population / 200000000) * 100)
  const growth = Math.min(100, Math.max(0, (indicators.demographic.populationGrowth + 2) / 4 * 100))
  const urbanization = Math.min(100, indicators.demographic.urbanization)
  const age = Math.min(100, Math.max(0, (50 - indicators.demographic.medianAge) / 20 * 100))
  const literacy = Math.min(100, indicators.demographic.literacyRate)

  return Math.round((population * 0.3 + growth * 0.2 + urbanization * 0.2 + age * 0.15 + literacy * 0.15) * 10) / 10
}

/**
 * Calculate energy power sub-index
 */
export function calculateEnergyPower(indicators: PowerIndicators): number {
  const oilProd = Math.min(100, (indicators.energy.oilProduction / 10000000) * 100)
  const oilRes = Math.min(100, (indicators.energy.oilReserves / 300) * 100)
  const gasProd = Math.min(100, (indicators.energy.gasProduction / 500000000000) * 100)
  const gasRes = Math.min(100, (indicators.energy.gasReserves / 50000000000000) * 100)
  const renewable = Math.min(100, (indicators.energy.renewableCapacity / 200000) * 100)
  const consumption = Math.min(100, (indicators.energy.energyConsumption / 1000) * 100)

  return Math.round((oilProd * 0.25 + oilRes * 0.2 + gasProd * 0.2 + gasRes * 0.15 + renewable * 0.1 + consumption * 0.1) * 10) / 10
}

/**
 * Get power ranking for countries
 */
export function getPowerRankings(
  countriesData: Array<{ countryId: string; indicators: PowerIndicators; allianceCentrality?: number; conflictIntensity?: number }>
): Array<{ countryId: string; powerIndex: PowerIndexComponents; rank: number }> {
  const rankings = countriesData.map(data => ({
    countryId: data.countryId,
    powerIndex: calculatePowerIndex(
      data.indicators, 
      data.allianceCentrality || 0, 
      data.conflictIntensity || 0
    )
  }))

  // Sort by total power index (descending)
  rankings.sort((a, b) => b.powerIndex.total - a.powerIndex.total)

  // Add rank
  return rankings.map((item, index) => ({
    ...item,
    rank: index + 1
  }))
}

/**
 * Compare two countries' power indices
 */
export function comparePowerIndices(
  country1: PowerIndicators,
  country2: PowerIndicators,
  allianceCentrality1: number = 0,
  allianceCentrality2: number = 0,
  conflictIntensity1: number = 0,
  conflictIntensity2: number = 0
): {
  country1: PowerIndexComponents
  country2: PowerIndexComponents
  differences: PowerIndexComponents
} {
  const power1 = calculatePowerIndex(country1, allianceCentrality1, conflictIntensity1)
  const power2 = calculatePowerIndex(country2, allianceCentrality2, conflictIntensity2)

  const differences: PowerIndexComponents = {
    military: Math.round((power1.military - power2.military) * 10) / 10,
    economic: Math.round((power1.economic - power2.economic) * 10) / 10,
    demographic: Math.round((power1.demographic - power2.demographic) * 10) / 10,
    energy: Math.round((power1.energy - power2.energy) * 10) / 10,
    allianceCentrality: Math.round((power1.allianceCentrality - power2.allianceCentrality) * 10) / 10,
    conflictStability: Math.round((power1.conflictStability - power2.conflictStability) * 10) / 10,
    total: Math.round((power1.total - power2.total) * 10) / 10
  }

  return {
    country1: power1,
    country2: power2,
    differences
  }
}

