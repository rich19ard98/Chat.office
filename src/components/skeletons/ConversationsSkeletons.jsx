import { Skeleton } from "primereact/skeleton";

export default function ComversationsSkeletons({ size }) {
          return (
                    <div className="py-3 px-3">
                              {new Array(size ? size : 10).fill(0).map((_, index) => {
                                        return (
                                        <div className="d-flex mb-3" key={index}>
                                                  <Skeleton shape="circle" size="2rem" className="mr-1"></Skeleton>
                                                  <div className='mx-2'>
                                                            <Skeleton width="5rem" height='1rem' className="mb-1"></Skeleton>
                                                            <Skeleton width="10rem" height='0.5rem'  className="mb-1"></Skeleton>
                                                  </div>
                                        </div>
                              )
                              })}
                    </div>
          )
}