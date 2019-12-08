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
    rows = take 2 (split input '\n')
    paths = map decodePath rows
    lines = map (followPath (0, 0) []) paths
    maybeCross = pathIntersects (head lines) (tail lines)
    cross = catMaybes maybeCross
    crossDist = map (abs . manhattan) cross
    minCrossDist = minimum crossDist

manhattan :: Vec -> Int
manhattan (x,y) = x+y

decodePath :: String -> [Seg]
decodePath path = map decodeSeg (split path ',')

decodeSeg :: String -> Seg
decodeSeg seg = (head seg, read (tail seg))

pathIntersects :: [Line] -> [[Line]] -> [Maybe Vec]
pathIntersects _ [] = []
pathIntersects [] rest = pathIntersects (head rest) (tail rest)
pathIntersects path rest = pathIntersects (tail path) rest ++ crossings
  where
    crossings = head path `intersectWith` concat rest

intersectWith :: Line -> [Line] -> [Maybe Vec]
intersectWith line [] = []
intersectWith line lines = intersectWith line (tail lines) ++ [line `intersect` head lines]

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
    ((vfx, vfy), (vtx, vty)) = v
    ((hfx, hfy), (htx, hty)) = h

followPath :: Vec -> [Line] -> [Seg] -> [Line]
followPath from lines [] = lines
followPath from lines path = followPath to (lines ++ [line]) (tail path)
  where
    (dir, len) = head path
    (x, y) = from
    (x1, y1) = to
    to =
      case dir of
        'R' -> (x + len, y)
        'L' -> (x - len, y)
        'U' -> (x, y + len)
        'D' -> (x, y - len)
    line = ((min x x1, min y y1), (max x x1, max y y1))

run2 :: String -> IO ()
run2 input = print "Not done"