module Day3
    ( run1,
      run2
    ) where

import Lib
import Data.Maybe (isJust, catMaybes)

type Seg = (Char, Int)
type Vec = (Int, Int)
type Line = (Vec, Vec)

run1 :: String -> IO ()
run1 input = print minCrossDist
  where
    lines = decode input
    maybeCross = compareAll intersect (head lines) (tail lines)
    cross = catMaybes maybeCross
    crossDist = map (abs . manhattan) cross
    minCrossDist = minimum crossDist

intersect :: Line -> Line -> Maybe Vec
intersect h v
  | vfx == vtx && hfx == htx = Nothing -- Both horizontal
  | vfy == vty && hfy == hty = Nothing -- Both vertical
  | vfy == vty = v `intersect` h -- Was Vertical Horizontal, want Horizontal Vertical
  | vfy > hfy = Nothing
  | vty < hty = Nothing
  | htx < vtx = Nothing
  | hfx > vfx = Nothing
  | vfx == 0 && hfy == 0 = Nothing
  | otherwise = Just (vfx, hfy)
  where
    ((vfx, vfy), (vtx, vty)) = bbox v
    ((hfx, hfy), (htx, hty)) = bbox h

-- Part b

type SignalLine = (Int, Line)

run2 :: String -> IO ()
run2 input = print minCrossDist
  where
    lines = decode input
    distLines = map (toSignalLines 0) lines
    maybeCross = compareAll signalIntersect (head distLines) (tail distLines)
    cross = catMaybes maybeCross
    minCrossDist = minimum cross

toSignalLines :: Int -> [Line] -> [SignalLine]
toSignalLines _ [] = []
toSignalLines dist lines = distLine : toSignalLines nextDist (tail lines)
  where
    line = head lines
    ((x1, y1), (x2, y2)) = line
    distLine = (dist, line)
    nextDist = dist + abs (x1 - x2) + abs (y1 - y2)

signalIntersect :: SignalLine -> SignalLine -> Maybe Int
signalIntersect h v =
  case hl `intersect` vl of
    Just (cx, cy) -> Just (dist1 + dist2 + abs (y - cy) + abs (x - cx))
    Nothing -> Nothing
  where
    (dist1, vl) = v
    (dist2, hl) = h
    ((_, y), _) = hl
    ((x, _), _) = vl

-- Shared

bbox :: Line -> Line
bbox (p1, p2) = ((min x x1, min y y1), (max x x1, max y y1))
  where
    (x, y) = p1
    (x1, y1) = p2

manhattan :: Vec -> Int
manhattan (x,y) = x+y

decode :: String -> [[Line]]
decode input = lines
  where
    rows = take 2 (split input '\n')
    paths = map decodePath rows
    lines = map (toLines (0, 0) []) paths

decodePath :: String -> [Seg]
decodePath path = map decodeSegment (split path ',')

decodeSegment :: String -> Seg
decodeSegment seg = (head seg, read (tail seg))

toLines :: Vec -> [Line] -> [Seg] -> [Line]
toLines from lines [] = lines
toLines from lines path = toLines to (lines ++ [line]) (tail path)
  where
    (dir, len) = head path
    (x, y) = from
    to =
      case dir of
        'R' -> (x + len, y)
        'L' -> (x - len, y)
        'U' -> (x, y + len)
        'D' -> (x, y - len)
    line = (from, to)

compareAll :: (a -> a -> b) -> [a] -> [[a]] -> [b]
compareAll _ _ [] = []
compareAll f path other = compareAll f (head other) (tail other) ++ res
  where
    compOther p = map (f p) (concat other)
    res = concatMap compOther path