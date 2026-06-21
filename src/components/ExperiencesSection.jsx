import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { Calendar, Briefcase, ChevronRight } from 'lucide-react'

// Sprouts a wiggling leaf at (x, y) coordinates with a specified angle and stagger delay.
const renderLeaf = (x, y, angle, delay = 0) => {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`} key={`leaf-${x}-${y}-${angle}-${delay}`}>
      <motion.image
        href="/leaf.png"
        x={-10}
        y={-20}
        width={20}
        height={20}
        style={{ originX: 0.5, originY: 1 }}
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          rotate: [-12, 12, -12]
        }}
        transition={{
          scale: { duration: 0.5, ease: "easeOut", delay: delay * 0.1 },
          rotate: { repeat: Infinity, duration: 3 + (delay % 1.5), ease: "easeInOut" }
        }}
      />
    </g>
  )
}

// Sprouts a wiggling grass blade at the base of the trunk.
const renderGrass = (x, y, delay = 0) => {
  return (
    <g transform={`translate(${x}, ${y})`} key={`grass-${x}-${y}-${delay}`}>
      <motion.path
        d="M 0 0 Q -4 -8, -8 -12 Q -2 -8, 0 0"
        fill="#facc15"
        style={{ transformOrigin: "0px 0px" }}
        animate={{
          rotate: [-8, 8, -8]
        }}
        transition={{
          repeat: Infinity,
          duration: 3.5 + (delay % 2),
          ease: "easeInOut",
          delay: delay * 0.2
        }}
      />
    </g>
  )
}

// Renders the tapered trunk from ground surface (soilTop) to top y=0, including root flares and bark textures.
const renderTrunk = (coords) => {
  const { trunkX, soilTop, points } = coords
  const n = points.length
  if (n === 0) return null

  const trunkSegments = []

  // 1. Root Flares at the soil surface boundary
  const bottomY = soilTop
  trunkSegments.push(
    <motion.path
      key="root-left-1"
      d={`M ${trunkX} ${bottomY - 40} Q ${trunkX - 35} ${bottomY - 10}, ${trunkX - 60} ${bottomY}`}
      stroke="url(#trunkGrad)"
      strokeWidth={7}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />,
    <motion.path
      key="root-right-1"
      d={`M ${trunkX} ${bottomY - 40} Q ${trunkX + 35} ${bottomY - 10}, ${trunkX + 60} ${bottomY}`}
      stroke="url(#trunkGrad)"
      strokeWidth={7}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />,
    <motion.path
      key="root-left-2"
      d={`M ${trunkX - 8} ${bottomY - 70} Q ${trunkX - 45} ${bottomY - 15}, ${trunkX - 90} ${bottomY}`}
      stroke="url(#trunkGrad)"
      strokeWidth={5}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />,
    <motion.path
      key="root-right-2"
      d={`M ${trunkX + 8} ${bottomY - 70} Q ${trunkX + 45} ${bottomY - 15}, ${trunkX + 90} ${bottomY}`}
      stroke="url(#trunkGrad)"
      strokeWidth={5}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  )

  // 2. Grass Sprouts at the soil surface base
  trunkSegments.push(
    renderGrass(trunkX - 10, bottomY, 1),
    renderGrass(trunkX + 10, bottomY, 2)
  )

  // 3. Bottom trunk: from soilTop (ground surface) to lowest point (oldest experience)
  const lowestPt = points[n - 1]
  const bottomTrunkD = `M ${trunkX} ${bottomY} Q ${trunkX + 10} ${(bottomY + lowestPt.y) / 2}, ${trunkX} ${lowestPt.y}`
  trunkSegments.push(
    <motion.path
      key="trunk-bottom"
      d={bottomTrunkD}
      stroke="url(#trunkGrad)"
      strokeWidth={4 + n * 2.5}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  )

  // 4. Intermediate segments: winding curved paths connecting point y-coordinates with bark details
  for (let i = n - 1; i > 0; i--) {
    const ptCurrent = points[i]
    const ptNext = points[i - 1]
    const isEven = i % 2 === 0
    const ctrlX = trunkX + (isEven ? 18 : -18)
    const strokeWidth = 4 + i * 2.5
    const segmentD = `M ${trunkX} ${ptCurrent.y} Q ${ctrlX} ${(ptCurrent.y + ptNext.y) / 2}, ${trunkX} ${ptNext.y}`

    // Main segment path
    trunkSegments.push(
      <motion.path
        key={`trunk-seg-${i}`}
        d={segmentD}
        stroke="url(#trunkGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: (n - 1 - i) * 0.15, ease: "easeInOut" }}
      />
    )

    // Vertical bark grain lines for texture on thick segments
    if (strokeWidth > 6) {
      trunkSegments.push(
        <motion.path
          key={`trunk-bark-l-${i}`}
          d={`M ${trunkX - 3} ${ptCurrent.y} Q ${ctrlX - 2} ${(ptCurrent.y + ptNext.y) / 2}, ${trunkX - 2} ${ptNext.y}`}
          stroke="#451a03"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
          opacity={0.45}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: (n - 1 - i) * 0.15, ease: "easeInOut" }}
        />,
        <motion.path
          key={`trunk-bark-r-${i}`}
          d={`M ${trunkX + 3} ${ptCurrent.y} Q ${ctrlX + 2} ${(ptCurrent.y + ptNext.y) / 2}, ${trunkX + 2} ${ptNext.y}`}
          stroke="#451a03"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
          opacity={0.45}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: (n - 1 - i) * 0.15, ease: "easeInOut" }}
        />
      )
    }
  }

  // 5. Top segment: from highest point to container top y=0
  const topPt = points[0]
  const topTrunkD = `M ${trunkX} ${topPt.y} Q ${trunkX - 10} ${topPt.y / 2}, ${trunkX} 0`
  trunkSegments.push(
    <motion.path
      key="trunk-top"
      d={topTrunkD}
      stroke="url(#trunkGrad)"
      strokeWidth={4}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.0, delay: n * 0.15, ease: "easeInOut" }}
    />
  )

  return trunkSegments
}

// Renders leaf nodes connected by small wiggling twigs directly along the trunk surface
const renderTrunkLeaves = (coords) => {
  const { trunkX, points } = coords
  const n = points.length
  if (n < 2) return null

  const trunkLeaves = []
  for (let i = n - 1; i > 0; i--) {
    const ptCurrent = points[i]
    const ptNext = points[i - 1]
    const midY = (ptCurrent.y + ptNext.y) / 2
    
    const isEven = i % 2 === 0
    const twigLength = 12
    const endX = isEven ? trunkX + twigLength : trunkX - twigLength
    const endY = midY - 6
    const angle = isEven ? 75 : -75
    
    trunkLeaves.push(
      <g key={`trunk-twig-group-${i}`}>
        {/* Small trunk twig path */}
        <motion.path
          d={`M ${trunkX} ${midY} Q ${(trunkX + endX) / 2} ${midY - 3}, ${endX} ${endY}`}
          stroke="url(#trunkGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        />
        {/* Leaf on the twig tip */}
        {renderLeaf(endX, endY, angle, i * 3)}
      </g>
    )
  }
  return trunkLeaves
}

// Renders the lush leaf canopy (crown) at the very top of the tree trunk
const renderCanopy = (coords) => {
  const { trunkX } = coords
  const canopy = []
  
  const leavesConfig = [
    { x: trunkX, y: 5, angle: 0, delay: 1 },
    { x: trunkX - 8, y: 8, angle: -30, delay: 2 },
    { x: trunkX + 8, y: 8, angle: 30, delay: 3 },
    { x: trunkX - 18, y: 15, angle: -60, delay: 4 },
    { x: trunkX + 18, y: 15, angle: 60, delay: 5 },
    { x: trunkX - 26, y: 22, angle: -90, delay: 6 },
    { x: trunkX + 26, y: 22, angle: 90, delay: 7 },
  ]

  leavesConfig.forEach((cfg, idx) => {
    canopy.push(
      renderLeaf(cfg.x, cfg.y, cfg.angle, cfg.delay)
    )
  })

  return canopy
}

// Renders root connections growing on scroll from tree base down to skill bubbles
const renderRootsAndNutrients = (coords, rootPathLength) => {
  const { trunkX, soilTop, skillPoints } = coords
  if (skillPoints.length === 0) return null

  const baseY = soilTop
  const elements = []

  skillPoints.forEach((skillPt, idx) => {
    if (skillPt.x === 0 && skillPt.y === 0) return

    // Path from trunk base down to skill center (reversed curve so it grows downwards)
    const rootPathD = `M ${trunkX} ${baseY} C ${trunkX} ${(baseY + skillPt.y) / 2}, ${skillPt.x} ${(baseY + skillPt.y) / 2}, ${skillPt.x} ${skillPt.y}`

    // Root path line grows exactly based on scroll progress
    elements.push(
      <motion.path
        key={`root-line-${idx}`}
        d={rootPathD}
        stroke="url(#trunkGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity={0.65}
        style={{ pathLength: rootPathLength }}
      />
    )
  })

  return elements
}

// Renders continuous nutrient streams flowing all the way from root bubbles through trunk to branch cards
const renderNutrientFlows = (coords, skills, experiences, rootPathLength) => {
  const { trunkX, soilTop, points, skillPoints } = coords
  const n = points.length
  if (n === 0 || skillPoints.length === 0) return null

  const elements = []

  skillPoints.forEach((skillPt, idx) => {
    if (skillPt.x === 0 && skillPt.y === 0) return

    // 1. Determine target card index (equally distributes skills to cards)
    const targetCardIdx = Math.max(0, n - 1 - Math.floor((idx / skills.length) * n))
    
    // 2. Build the continuous path from skillPt to card edge
    // A. Start with root path
    let flowD = `M ${skillPt.x} ${skillPt.y} C ${skillPt.x} ${(skillPt.y + soilTop) / 2}, ${trunkX} ${(skillPt.y + soilTop) / 2}, ${trunkX} ${soilTop}`

    // B. Climb trunk up to targetCardIdx
    const lowestPt = points[n - 1]
    flowD += ` Q ${trunkX + 10} ${(soilTop + lowestPt.y) / 2}, ${trunkX} ${lowestPt.y}`

    for (let i = n - 1; i > targetCardIdx; i--) {
      const ptCurrent = points[i]
      const ptNext = points[i - 1]
      const isEven = i % 2 === 0
      const ctrlX = trunkX + (isEven ? 18 : -18)
      flowD += ` Q ${ctrlX} ${(ptCurrent.y + ptNext.y) / 2}, ${trunkX} ${ptNext.y}`
    }

    // C. Branch off to the card
    const targetPt = points[targetCardIdx]
    const isMobile = trunkX === 32
    const isLeft = !isMobile && targetPt.isEven
    const branchLength = isMobile ? 40 : 80
    const endX = isLeft ? trunkX - branchLength : trunkX + branchLength
    const ctrlX = isLeft ? trunkX - branchLength / 2 : trunkX + branchLength / 2
    const ctrlY = targetPt.y - 20

    flowD += ` Q ${ctrlX} ${ctrlY}, ${endX} ${targetPt.y}`

    // 3. Render 4 glowing nutrient/water particles per path, spaced out and styled
    const particleColors = ["#facc15", "#22d3ee", "#eab308", "#38bdf8"] // gold, cyan, yellow-600, sky-400
    for (let p = 0; p < 4; p++) {
      const color = particleColors[(idx + p) % particleColors.length]
      const size = 1.8 + ((idx + p) % 3) * 0.7 // 1.8px, 2.5px, 3.2px
      const glowColor = color === "#22d3ee" || color === "#38bdf8" ? "#38bdf8" : "#facc15"
      const duration = 4.5 + ((idx * 7 + p * 13) % 5) * 0.5 // 4.5s to 6.5s
      const delay = idx * 0.3 + p * 1.5

      elements.push(
        <motion.circle
          key={`nutrient-flow-${idx}-${p}`}
          r={size}
          fill={color}
          style={{ 
            offsetPath: `path('${flowD}')`,
            filter: `drop-shadow(0 0 5px ${glowColor})`
          }}
          animate={{
            offsetDistance: ["0%", "100%"],
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            repeat: Infinity,
            duration: duration,
            delay: delay,
            ease: "linear"
          }}
        />
      )
    }
  })

  // The flows only fade in and activate once the roots grow downward to meet the logos
  return (
    <motion.g style={{ opacity: rootPathLength }}>
      {elements}
    </motion.g>
  )
}

// Renders the curved connecting branches, wiggling branch leaves, and the connector dots
const renderBranchAndLeaves = (pt, idx, trunkX) => {
  const isMobile = trunkX === 32
  const isLeft = !isMobile && pt.isEven

  const branchLength = isMobile ? 40 : 80
  const endX = isLeft ? trunkX - branchLength : trunkX + branchLength
  const ctrlX = isLeft ? trunkX - branchLength / 2 : trunkX + branchLength / 2
  const ctrlY = pt.y - 20
  
  const branchD = `M ${trunkX} ${pt.y} Q ${ctrlX} ${ctrlY}, ${endX} ${pt.y}`
  const delay = idx * 0.15 + 0.3

  // Math to map wiggling leaves exactly along the branch curve coordinates using quadratic Bezier logic
  const getBezierPt = (t) => {
    const tPrime = 1 - t
    const x = tPrime * tPrime * trunkX + 2 * tPrime * t * ctrlX + t * t * endX
    const y = tPrime * tPrime * pt.y + 2 * tPrime * t * ctrlY + t * t * pt.y
    return { x, y }
  }

  const leafPt1 = getBezierPt(isMobile ? 0.5 : 0.4)
  const leafPt2 = getBezierPt(isMobile ? 0.8 : 0.7)

  // Construct organic twigs shooting off the main branch to support leaves
  const twigX1 = isLeft ? leafPt1.x - 12 : leafPt1.x + 12
  const twigY1 = leafPt1.y - 12
  const twigD1 = `M ${leafPt1.x} ${leafPt1.y} Q ${(leafPt1.x + twigX1) / 2} ${leafPt1.y - 8}, ${twigX1} ${twigY1}`

  const twigX2 = isLeft ? leafPt2.x - 10 : leafPt2.x + 10
  const twigY2 = leafPt2.y - 10
  const twigD2 = `M ${leafPt2.x} ${leafPt2.y} Q ${(leafPt2.x + twigX2) / 2} ${leafPt2.y - 6}, ${twigX2} ${twigY2}`

  const leafAngle1 = isLeft ? -55 : 55
  const leafAngle2 = isLeft ? -35 : 35

  return (
    <g key={`branch-group-${idx}`}>
      {/* Branch Svg Path */}
      <motion.path
        d={branchD}
        stroke={isLeft ? "url(#branchGradLeft)" : "url(#branchGradRight)"}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      />

      {/* Sprouting leaf twigs */}
      <motion.path
        d={twigD1}
        stroke={isLeft ? "url(#branchGradLeft)" : "url(#branchGradRight)"}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      />
      <motion.path
        d={twigD2}
        stroke={isLeft ? "url(#branchGradLeft)" : "url(#branchGradRight)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      />

      {/* Sprouting leaves on twig tips */}
      {renderLeaf(twigX1, twigY1, leafAngle1, idx * 2 + 1)}
      {renderLeaf(twigX2, twigY2, leafAngle2, idx * 2 + 2)}

      {/* Junction Connector Dots */}
      <motion.circle
        cx={trunkX}
        cy={pt.y}
        r={11}
        fill="#facc15"
        opacity={0.2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.1 }}
      />
      <motion.circle
        cx={trunkX}
        cy={pt.y}
        r={7}
        fill="#0B0F1A"
        stroke="#facc15"
        strokeWidth={3}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: idx * 0.1 }}
      />
    </g>
  )
}

export default function ExperiencesSection() {
  const [experiences, setExperiences] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  
  const containerRef = useRef(null)
  const soilRef = useRef(null)
  const rowRefs = useRef([])
  const [coords, setCoords] = useState({ trunkX: 0, containerWidth: 0, containerHeight: 0, soilTop: 0, points: [], skillPoints: [] })

  const { scrollYProgress } = useScroll({
    target: soilRef,
    offset: ["start end", "end start"]
  })

  // Smoothly grow roots downward as the soil bed enters the viewport, keeping them fully grown as they move up the screen
  const rootPathLength = useTransform(scrollYProgress, [0.05, 0.45], [0, 1], { clamp: true })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch experiences
      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
        .order('start_date', { ascending: false })

      if (expError) throw expError
      setExperiences(expData || [])

      // Fetch tech stack skills
      const { data: skillData, error: skillError } = await supabase
        .from('techstack')
        .select('*')

      if (skillError) throw skillError
      setSkills(skillData || [])
    } catch (error) {
      console.error('Error fetching tree data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCoords = () => {
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height
    const isMobile = window.innerWidth < 768
    const trunkX = isMobile ? 32 : containerRect.width / 2

    let soilTop = containerHeight
    if (soilRef.current) {
      const soilRect = soilRef.current.getBoundingClientRect()
      soilTop = soilRect.top - containerRect.top
    }

    const points = experiences.map((exp, idx) => {
      const rowEl = rowRefs.current[idx]
      if (!rowEl) return { y: 0, isEven: idx % 2 === 0 }
      const rowRect = rowEl.getBoundingClientRect()
      
      const y = isMobile 
        ? (rowRect.top - containerRect.top + 48)
        : (rowRect.top - containerRect.top + rowRect.height / 2)

      return {
        y,
        isEven: idx % 2 === 0
      }
    })

    // Mathematically calculate pixel coordinates for skill bubbles to span horizontally
    const skillPoints = skills.map((skill, idx) => {
      const S = skills.length
      if (isMobile) {
        // Wrap items into three clean rows: 3, 3, and remaining (2)
        let row, colIdx, colCount
        if (idx < 3) {
          row = 0
          colIdx = idx
          colCount = 3
        } else if (idx < 6) {
          row = 1
          colIdx = idx - 3
          colCount = 3
        } else {
          row = 2
          colIdx = idx - 6
          colCount = S - 6
        }

        const startX = 65
        const endX = containerWidth - 25
        const span = endX - startX

        let x
        if (colCount === 2) {
          // Center the two items in the last row beautifully
          const midX = startX + span / 2
          const offset = span / 5
          x = colIdx === 0 ? midX - offset : midX + offset
        } else if (colCount === 1) {
          x = startX + span / 2
        } else {
          const gap = span / (colCount - 1)
          x = startX + colIdx * gap
        }

        const y = soilTop + 215 + row * 90
        return { x, y }
      } else {
        const startX = 80
        const endX = containerWidth - 80
        const span = endX - startX
        const gap = S > 1 ? span / (S - 1) : span
        const x = startX + idx * gap
        const y = soilTop + 205 // pushed down by 45px in desktop
        return { x, y }
      }
    })

    setCoords({ trunkX, containerWidth, containerHeight, soilTop, points, skillPoints })
  }

  useEffect(() => {
    if (experiences.length === 0) return

    const handleResize = () => {
      updateCoords()
    }

    updateCoords()

    let observer
    if (containerRef.current && window.ResizeObserver) {
      observer = new window.ResizeObserver(() => {
        updateCoords()
      })
      observer.observe(containerRef.current)
    }

    window.addEventListener('resize', handleResize)
    const timer1 = setTimeout(updateCoords, 100)
    const timer2 = setTimeout(updateCoords, 500)
    const timer3 = setTimeout(updateCoords, 1200)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (observer && containerRef.current) {
        observer.unobserve(containerRef.current)
      }
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [experiences, skills])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const getDuration = (exp) => {
    const start = formatDate(exp.start_date)
    const end = exp.is_ongoing ? 'Present' : formatDate(exp.end_date)
    return `${start} — ${end}`
  }

  if (loading) {
    return (
      <section className="py-20 bg-[#0B0F1A]">
        <div className="max-w-7xl mx-auto px-6 text-center text-yellow-500 animate-pulse font-bold tracking-widest uppercase">
          Growing Career Tree...
        </div>
      </section>
    )
  }

  if (experiences.length === 0) return null

  return (
    <section id="experience" className="py-24 bg-[#0B0F1A] border-t border-white/5 relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <motion.div
          className="mb-24 text-center"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Career <span className="text-yellow-400">Tree</span>
          </h2>
          <div className="h-1.5 w-20 bg-yellow-400 mt-4 mx-auto rounded-full" />
        </motion.div>

        {/* --- TIMELINE CONTAINER --- */}
        <div ref={containerRef} className="relative">
          
          {/* Unified tree SVG background */}
          {coords.containerHeight > 0 && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              style={{ height: coords.containerHeight }}
            >
              <defs>
                <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#854d0e" /> {/* yellow-800 */}
                  <stop offset="50%" stopColor="#a16207" /> {/* yellow-700 */}
                  <stop offset="100%" stopColor="#713f12" /> {/* yellow-900 */}
                </linearGradient>
                <linearGradient id="branchGradLeft" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#a16207" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
                <linearGradient id="branchGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a16207" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
                <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1a110a" /> {/* organic warm soil */}
                  <stop offset="35%" stopColor="#120c07" />
                  <stop offset="100%" stopColor="#080503" /> {/* deep dark earth */}
                </linearGradient>
              </defs>

              {/* Render dynamic soil bed layer inside SVG */}
              {coords.soilTop > 0 && (
                <path
                  d={`M 0 ${coords.soilTop} Q ${coords.containerWidth / 4} ${coords.soilTop + 15}, ${coords.containerWidth / 2} ${coords.soilTop - 10} T ${coords.containerWidth} ${coords.soilTop} L ${coords.containerWidth} ${coords.containerHeight} L 0 ${coords.containerHeight} Z`}
                  fill="url(#soilGrad)"
                />
              )}

              {/* Render trunk segments */}
              {renderTrunk(coords)}

              {/* Render trunk leaves */}
              {renderTrunkLeaves(coords)}

              {/* Render canopy top */}
              {renderCanopy(coords)}

              {/* Render skills roots growing on scroll */}
              {renderRootsAndNutrients(coords, rootPathLength)}

              {/* Render continuous nutrient flows from roots to branches */}
              {renderNutrientFlows(coords, skills, experiences, rootPathLength)}

              {/* Render branches & connector dots */}
              {coords.points.map((pt, idx) => renderBranchAndLeaves(pt, idx, coords.trunkX))}

              {/* Render Skills inside foreignObject elements for pixel-perfect alignment & interactivity */}
              {skills.length > 0 && coords.skillPoints.map((skillPt, idx) => {
                const skill = skills[idx]
                if (!skill || (skillPt.x === 0 && skillPt.y === 0)) return null

                // Set bounding box for the nutrient bubble and label
                const boxW = 100
                const boxH = 120
                const fX = skillPt.x - boxW / 2
                const fY = skillPt.y - 36 // center of 72px bubble aligned to skillPt.y

                return (
                  <foreignObject
                    key={`skill-fo-${skill.id}`}
                    x={fX}
                    y={fY}
                    width={boxW}
                    height={boxH}
                    className="overflow-visible pointer-events-auto"
                  >
                    <div className="flex flex-col items-center group cursor-pointer select-none">
                      {/* Floating Bubble Container */}
                      <motion.div 
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#111827]/95 border border-white/10 group-hover:border-yellow-400 p-2.5 flex items-center justify-center shadow-2xl relative z-10 transition-all duration-300 transform group-hover:scale-110"
                        animate={{
                          y: [-2, 2, -2]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 4 + (idx % 3) * 0.6,
                          ease: "easeInOut"
                        }}
                      >
                        <img
                          src={skill.logo_url}
                          alt={skill.name}
                          className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(250,204,21,0.25)] group-hover:drop-shadow-[0_0_12px_rgba(250,204,21,0.65)] transition-all duration-300"
                        />
                      </motion.div>

                      {/* Text Label */}
                      <div className="mt-2 md:mt-4 bg-[#0B0F1A]/85 backdrop-blur-sm rounded-md px-2 py-0.5 md:px-2.5 md:py-1 border border-white/5 shadow-md z-10 transition-colors group-hover:border-yellow-400/30">
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.12em] md:tracking-[0.15em] text-slate-300 group-hover:text-yellow-400 transition-colors text-center whitespace-nowrap px-1 block">
                          {skill.name}
                        </span>
                      </div>
                    </div>
                  </foreignObject>
                )
              })}
            </svg>
          )}

          {/* Timeline Items */}
          <div className="space-y-16 md:space-y-24 relative z-10">
            {experiences.map((exp, idx) => {
              const isEven = idx % 2 === 0

              return (
                <div 
                  key={exp.id} 
                  ref={el => rowRefs.current[idx] = el}
                  className="relative flex flex-col md:flex-row items-stretch md:items-center min-h-[200px]"
                >
                  {/* Left side slot (Desktop: alternates card and spacer / watermark) */}
                  <div className="hidden md:flex md:w-1/2 pr-12 justify-end items-center">
                    {isEven ? (
                      /* Left Card + Spacer */
                      <div className="w-full max-w-lg flex items-center justify-end">
                        <motion.div
                          className="flex-1 max-w-md"
                          initial={{ opacity: 0, x: -60 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                          <TimelineCard exp={exp} duration={getDuration(exp)} align="right" />
                        </motion.div>
                        {/* Spacer where the branch SVG used to be */}
                        <div className="w-20 h-[60px] flex-shrink-0 hidden md:block" />
                      </div>
                    ) : (
                      /* Watermark logo on left when card is on right */
                      <motion.div
                        className="w-full max-w-md flex justify-end items-center pr-16 opacity-15 hover:opacity-35 hover:scale-105 transition-all duration-500 pointer-events-none select-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 0.15, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                      >
                        {exp.company_logo_url ? (
                          <img src={exp.company_logo_url} alt="" className="w-36 h-36 object-contain" />
                        ) : (
                          <Briefcase className="w-24 h-24 text-slate-500/40" />
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Right side slot (Desktop: alternates spacer and card / watermark, Mobile is stacked) */}
                  <div className="w-full md:w-1/2 pl-16 md:pl-12 flex justify-start items-center">
                    {!isEven ? (
                      /* Right Card + Spacer */
                      <div className="w-full max-w-lg hidden md:flex items-center justify-start">
                        {/* Spacer where the branch SVG used to be */}
                        <div className="w-20 h-[60px] flex-shrink-0 hidden md:block" />
                        <motion.div
                          className="flex-1 max-w-md"
                          initial={{ opacity: 0, x: 60 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                          <TimelineCard exp={exp} duration={getDuration(exp)} align="left" />
                        </motion.div>
                      </div>
                    ) : (
                      /* Watermark logo on right when card is on left */
                      <motion.div
                        className="w-full max-w-md hidden md:flex justify-start items-center pl-16 opacity-15 hover:opacity-35 hover:scale-105 transition-all duration-500 pointer-events-none select-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 0.15, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                      >
                        {exp.company_logo_url ? (
                          <img src={exp.company_logo_url} alt="" className="w-36 h-36 object-contain" />
                        ) : (
                          <Briefcase className="w-24 h-24 text-slate-500/40" />
                        )}
                      </motion.div>
                    )}

                    {/* Mobile: card with a small spacer on the left */}
                    <div className="w-full max-w-md md:hidden flex items-center mt-6">
                      {/* Mobile spacer */}
                      <div className="w-10 h-[40px] flex-shrink-0 md:hidden mr-2" />
                      <motion.div
                        className="flex-1"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        <TimelineCard exp={exp} duration={getDuration(exp)} align="left" />
                      </motion.div>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>

          {/* --- Soil Title & Spacer Bed (HTML references to map the soil background and coordinates) --- */}
          {skills.length > 0 && (
            <div ref={soilRef} className="relative z-10 mt-32 pt-16 pb-6 text-center select-none pointer-events-none flex flex-col items-center">
              {/* Black faded box behind the text */}
              <div className="bg-black/15 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl px-6 py-4 max-w-xl mx-auto mb-6 pointer-events-auto">
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                  Root <span className="text-yellow-400">Nutrients</span>
                </h3>
                <p className="text-[9px] md:text-[10px] text-slate-300 tracking-wider mt-2 uppercase font-bold px-2 leading-relaxed">
                  Skills feeding water & proteins to grow the career tree
                </p>
                <div className="h-1 w-12 bg-yellow-400/60 mt-3 mx-auto rounded-full" />
              </div>
              
              {/* Spacer matching height where skill foreignObjects are distributed */}
              <div style={{ height: window.innerWidth < 768 ? 490 : 260 }} className="w-full" />
            </div>
          )}

        </div>

      </div>
    </section>
  )
}

/* --- REUSABLE TIMELINE CARD (LEAF) COMPONENT --- */
function TimelineCard({ exp, duration, align }) {
  return (
    <Link to={`/experience/${exp.id}`} className="block group">
      <motion.div 
        className="bg-[#111827]/85 backdrop-blur-sm rounded-3xl border border-white/5 shadow-2xl hover:border-yellow-400/40 hover:shadow-[0_0_35px_rgba(250,204,21,0.08)] transition-all duration-500 overflow-hidden relative p-6 flex flex-col justify-between h-full"
        animate={{
          y: [-3, 3, -3],
          rotate: [-0.6, 0.6, -0.6]
        }}
        transition={{
          repeat: Infinity,
          duration: 5.5 + (exp.id % 3) * 0.8, // offset leaf sways
          ease: "easeInOut"
        }}
      >
        {/* Leaf-tip connection indicator pointing to the branch line */}
        <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#111827] border-t border-l border-white/5 group-hover:border-yellow-400/40 rotate-45 z-10 transition-colors duration-500 ${
          align === 'right' ? '-right-1.5 border-t border-r border-l-0' : '-left-1.5'
        }`} />

        <div className="space-y-4">
          {/* Header row: Company and logo */}
          <div className="flex items-center gap-4 justify-between">
            <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.25em]">
              {exp.company_name}
            </span>
            
            {exp.company_logo_url && (
              <div className="w-10 h-10 rounded-xl bg-[#0A0D16] p-1.5 flex items-center justify-center border border-white/5">
                <img
                  src={exp.company_logo_url}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Job Title */}
          <h3 className="text-xl font-black text-white group-hover:text-yellow-400 transition-colors leading-snug">
            {exp.role}
          </h3>

          {/* Timeline info */}
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-yellow-400/60" />
            <span>{duration}</span>
          </div>

          {/* Short description summary */}
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
            {exp.short_description}
          </p>
        </div>

        {/* Footer info & tags */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-black uppercase tracking-widest text-yellow-400 group-hover:text-yellow-300 transition-colors">
          <span>Details</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </motion.div>
    </Link>
  )
}
