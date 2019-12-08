module Lib 
    ( split
    ) where


split :: String -> Char -> [String]
split [] char = [""]
split (c:cs) char
  | c == char  = "" : rest
  | otherwise = (c : head rest) : tail rest
  where
    rest = split cs char