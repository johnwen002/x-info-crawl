import * as React from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button"; // 确保路径正确

interface CustomPaginationProps {
  totalPages: number;
  siblingCount?: number; // 控制当前页码两侧显示多少个页码按钮
  className?: string;
}

const paginationButtonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { type: "spring", stiffness: 200, damping: 15 },
};

const dotsVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.2 } },
  exit: { opacity: 0 },
};

const navigationButtonVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { delay: 0.1 } },
  exit: { opacity: 0, x: -10 },
};

const navigationButtonNextVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { delay: 0.1 } },
  exit: { opacity: 0, x: 10 },
};

const CustomPagination: React.FC<CustomPaginationProps> = ({
  totalPages,
  siblingCount = 1,
  className,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  // const navigate = useNavigate();
  const currentPage = Number(searchParams.get("page")) || 1;

  const onPageChange = (page: number | string) => {
    if (typeof page === "number") {
      if (page < 1 || page > totalPages) {
        return;
      }
      setSearchParams((prev) => {
        prev.set("page", String(page));
        return prev;
      });
    } else if (page === "prev") {
      if (currentPage > 1) {
        setSearchParams((prev) => {
          prev.set("page", String(currentPage - 1));
          return prev;
        });
      }
    } else if (page === "next") {
      if (currentPage < totalPages) {
        setSearchParams((prev) => {
          prev.set("page", String(currentPage + 1));
          return prev;
        });
      }
    } else if (page === "first") {
      setSearchParams((prev) => {
        prev.set("page", "1");
        return prev;
      });
    } else if (page === "last") {
      setSearchParams((prev) => {
        prev.set("page", String(totalPages));
        return prev;
      });
    }
  };

  const getPaginationRange = (): (number | string)[] => {
    const totalPageNumbers = siblingCount + 5; // siblingCount + firstPage + lastPage + currentPage + 2*DOTS

    // Case 1: If the number of pages is less than the page numbers we want to show in our paginationComponent
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    // Fallback, should not happen with the logic above but as a safeguard
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  const paginationRange = getPaginationRange();

  if (totalPages <= 1) {
    return null; // 如果只有一页或没有数据，则不显示分页
  }

  return (
    <nav
      aria-label="pagination"
      className={`flex items-center justify-center space-x-2 ${
        className || ""
      }`}
    >
      <motion.div
        variants={navigationButtonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange("first")}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          <DoubleArrowLeftIcon className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div
        variants={navigationButtonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange("prev")}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === "...") {
            return (
              <motion.span
                key={`dots-${index}`}
                className="px-4 py-2"
                variants={dotsVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                ...
              </motion.span>
            );
          }

          return (
            <motion.div
              key={pageNumber}
              variants={paginationButtonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Button
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(pageNumber as number)}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <motion.div
        variants={navigationButtonNextVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange("next")}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div
        variants={navigationButtonNextVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange("last")}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          <DoubleArrowRightIcon className="h-4 w-4" />
        </Button>
      </motion.div>
    </nav>
  );
};

export default CustomPagination;
